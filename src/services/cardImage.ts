// 名刺画像(表裏)の data URL 組み立てとサイズガード。
// requirements.md §4.3: アップロード前に表裏 base64 合計が MAX_TOTAL_BASE64 を超えたらエラーとする。

export const MAX_TOTAL_BASE64 = 900_000;

// requirements.md §3.3 の文言(preview アラート・新規)。1文字も変えないこと。
export const IMAGE_TOO_LARGE_MESSAGE = '画像サイズが大きすぎるため保存できませんでした';

/**
 * サイズ超過(MAX_TOTAL_BASE64 超え)を他の保存失敗と区別するための専用エラー。
 * preview.tsx の catch で instanceof 判定し、専用のアラート文言のみを表示する。
 */
export class ImageTooLargeError extends Error {
  constructor() {
    super(IMAGE_TOO_LARGE_MESSAGE);
    this.name = 'ImageTooLargeError';
  }
}

function sanitizeBase64(input: string): string {
  // data URL のプレフィックスを削除(png / jpeg どちらの image/\w+ 形式にも対応)
  let s = input.replace(/^data:image\/\w+;base64,/, '');
  // 改行など base64 以外の文字を除去
  s = s.replace(/[^A-Za-z0-9+/=]/g, '');
  return s;
}

export type CardImageDataUrls = {
  frontImageUrl: string;
  backImageUrl: string;
};

/**
 * 表裏の base64(data URL プレフィックスの有無どちらでも可)から JPEG の data URL を組み立てる。
 * 表裏合計の文字数が MAX_TOTAL_BASE64 を超える場合は保存前にエラーを投げる(setDoc を呼ばせない)。
 */
export function buildImageDataUrls(frontBase64: string, backBase64: string): CardImageDataUrls {
  const cleanedFront = sanitizeBase64(frontBase64);
  const cleanedBack = sanitizeBase64(backBase64);

  if (cleanedFront.length + cleanedBack.length > MAX_TOTAL_BASE64) {
    throw new ImageTooLargeError();
  }

  return {
    frontImageUrl: `data:image/jpeg;base64,${cleanedFront}`,
    backImageUrl: `data:image/jpeg;base64,${cleanedBack}`,
  };
}
