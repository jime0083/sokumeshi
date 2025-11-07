import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { storage, db, ensureAnonymousAuth } from './firebase';
import { CardMeta } from '@/src/types/card';

function sanitizeBase64(input: string): string {
  // remove data url prefix if present
  let s = input.replace(/^data:image\/\w+;base64,/, '');
  // strip any non-base64 characters (newlines, colons, spaces, etc.)
  s = s.replace(/[^A-Za-z0-9+/=]/g, '');
  return s;
}

async function uploadPng(base64: string, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const cleaned = sanitizeBase64(base64);
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
  // 1ユーザー1枚: 既存の画像を事前に削除
  try {
    await deleteObject(ref(storage, `${basePath}/front.png`));
  } catch {}
  try {
    await deleteObject(ref(storage, `${basePath}/back.png`));
  } catch {}
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


