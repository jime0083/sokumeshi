import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { storage, db, ensureAnonymousAuth } from './firebase';
import { CardMeta } from '@/src/types/card';

async function uploadPng(base64: string, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
  await uploadString(storageRef, cleaned, 'base64', { contentType: 'image/png' });
  return await getDownloadURL(storageRef);
}

export async function saveCardImagesAndMeta(params: {
  frontBase64: string;
  backBase64: string;
  meta: Omit<CardMeta, 'frontImageUrl' | 'backImageUrl' | 'createdAt' | 'updatedAt' | 'userId'>;
}): Promise<CardMeta> {
  const uid = await ensureAnonymousAuth();
  const cardId = params.meta.cardId;
  const basePath = `business_cards/${uid}/${cardId}`;
  const frontUrl = await uploadPng(params.frontBase64, `${basePath}/front.png`);
  const backUrl = await uploadPng(params.backBase64, `${basePath}/back.png`);

  const meta: CardMeta = {
    ...params.meta,
    userId: uid,
    frontImageUrl: frontUrl,
    backImageUrl: backUrl,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'cards', cardId), {
    ...meta,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return meta;
}


