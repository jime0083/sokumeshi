import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebase';
import { CardMeta } from '@/src/types/card';
import { buildImageDataUrls } from './cardImage';

export async function saveCardImagesAndMeta(params: {
  frontBase64: string;
  backBase64: string;
  meta: Omit<CardMeta, 'frontImageUrl' | 'backImageUrl' | 'createdAt' | 'updatedAt' | 'userId'>;
}): Promise<CardMeta> {
  // Firebase Storage を経由せず、画像データURL(JPEG)をそのまま Firestore に保存する。
  // サイズガード(900,000文字超)はここで setDoc 前に必ず通過する。
  const { frontImageUrl: frontUrl, backImageUrl: backUrl } = buildImageDataUrls(
    params.frontBase64,
    params.backBase64
  );

  const uid = await ensureAnonymousAuth();
  // 1ユーザーにつき1枚のみ保存できるよう、cardId は常に uid を使用する
  const cardId = uid;

  const meta: CardMeta = {
    ...params.meta,
    cardId,
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


