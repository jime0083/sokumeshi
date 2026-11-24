// Firebase SDK に依存しない判定ロジックのみを置く。
// (firebase SDK は jest-expo 環境で import できないため、ユニットテスト用に分離する)

/**
 * 開発ビルドかつ EXPO_PUBLIC_USE_FIREBASE_EMULATOR フラグが '1' のときだけ
 * Firebase Emulator への接続を行う。本番ビルド(isDev=false)では常に false。
 */
export function shouldUseEmulator(isDev: boolean, flag: string | undefined): boolean {
  return isDev === true && flag === '1';
}
