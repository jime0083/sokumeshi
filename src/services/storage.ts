import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebase';
import { CardMeta } from '@/src/types/card';

function sanitizeBase64(input: string): string {
  // data URL のプレフィックスを削除
  let s = input.replace(/^data:image\/\w+;base64,/, '');
  // 改行など base64 以外の文字を除去
  s = s.replace(/[^A-Za-z0-9+/=]/g, '');
  return s;
}

export async function saveCardImagesAndMeta(params: {
  frontBase64: string;
  backBase64: string;
  meta: Omit<CardMeta, 'frontImageUrl' | 'backImageUrl' | 'createdAt' | 'updatedAt' | 'userId'>;
}): Promise<CardMeta> {
  const uid = await ensureAnonymousAuth();
  const cardId = params.meta.cardId;

  // Firebase Storage を経由せず、画像データURLをそのまま Firestore に保存する
  const cleanedFront = sanitizeBase64(params.frontBase64);
  const cleanedBack = sanitizeBase64(params.backBase64);
  const frontUrl = `data:image/png;base64,${cleanedFront}`;
  const backUrl = `data:image/png;base64,${cleanedBack}`;

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


