// プロフィール写真の永続化(requirements.md §4.3)。
// ImagePicker のキャッシュ URI は OS がいつでも消しうるため、documentDirectory/profile/ へコピーし、
// ストアにはファイル名(相対パス)だけを保存する。表示時は resolveProfileImageUri で絶対パスへ解決する。

import * as FileSystem from 'expo-file-system/legacy';

export const PROFILE_DIR_NAME = 'profile';

function isAbsolutePath(value: string): boolean {
  return value.startsWith('file://') || value.startsWith('/');
}

/**
 * ストアに保存された値(相対パス、または旧形式の絶対パス)を表示用の絶対 URI に解決する。
 * 値が空なら undefined を返す。
 */
export function resolveProfileImageUri(
  value: string | undefined | null,
  documentDirectory: string | null
): string | undefined {
  if (!value) return undefined;
  if (isAbsolutePath(value)) return value;
  if (!documentDirectory) return undefined;
  return `${documentDirectory}${value}`;
}

async function ensureProfileDirectory(documentDirectory: string): Promise<void> {
  const dirUri = `${documentDirectory}${PROFILE_DIR_NAME}`;
  const info = await FileSystem.getInfoAsync(dirUri);
  if (!info || !info.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }
}

function extensionOf(uri: string): string {
  const match = uri.match(/\.(\w+)(?:\?.*)?$/);
  return match ? match[1] : 'jpg';
}

/**
 * 選択された写真(ImagePicker のキャッシュ URI 等)を documentDirectory/profile/ へコピーし、
 * 相対パス(例: 'profile/171234-abc.jpg')を返す。previousValue が profile/ 配下の相対パスなら、
 * コピー後に古いファイルを削除する(ディレクトリにゴミを溜めないため)。
 */
export async function copyImageToProfileDirectory(params: {
  sourceUri: string;
  documentDirectory: string;
  previousValue?: string;
}): Promise<string> {
  const { sourceUri, documentDirectory, previousValue } = params;

  await ensureProfileDirectory(documentDirectory);

  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}.${extensionOf(sourceUri)}`;
  const relativePath = `${PROFILE_DIR_NAME}/${fileName}`;
  const destUri = `${documentDirectory}${relativePath}`;

  await FileSystem.copyAsync({ from: sourceUri, to: destUri });

  if (previousValue && !isAbsolutePath(previousValue) && previousValue !== relativePath) {
    try {
      await FileSystem.deleteAsync(`${documentDirectory}${previousValue}`, { idempotent: true });
    } catch {
      // 古いファイルの削除失敗は無視する(表示には影響しない)
    }
  }

  return relativePath;
}

/**
 * 既存ユーザーの移行: 値が旧形式の絶対パスで、そのファイルが存在すれば profile/ へコピーして
 * 相対パスを返す。存在しなければ値をそのまま返す(変更しない)。既に相対パスならそのまま返す。
 */
export async function migrateLegacyProfileImage(params: {
  value: string | undefined;
  documentDirectory: string;
}): Promise<string | undefined> {
  const { value, documentDirectory } = params;
  if (!value) return value;
  if (!isAbsolutePath(value)) return value;

  try {
    const info = await FileSystem.getInfoAsync(value);
    if (!info || !info.exists) {
      return value;
    }
    return await copyImageToProfileDirectory({ sourceUri: value, documentDirectory });
  } catch {
    return value;
  }
}
