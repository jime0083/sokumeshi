// Firebase SDK に依存しない判定ロジックのみを置く。
// (firebase SDK は jest-expo 環境で import できないため、ユニットテスト用に分離する)

/**
 * ensureAnonymousAuth が利用する Auth の最小インターフェース。
 * firebase/auth の Auth 型を直接使わず、必要なプロパティのみを定義する。
 */
export interface AnonymousAuthLike {
  authStateReady: () => Promise<void>;
  readonly currentUser: { uid: string } | null;
}

export type SignInAnonymously = () => Promise<{ user: { uid: string } }>;

/**
 * 永続化された匿名ユーザーの復元を待ってから uid を確定する。
 * 復元されたユーザーがいればそれを使い、いなければ新規に匿名サインインする。
 * (P-007: 復元前に signIn してしまうと名刺 URL が変わる不具合の修正)
 */
export async function resolveAnonymousUid(
  auth: AnonymousAuthLike,
  signInAnonymously: SignInAnonymously
): Promise<string> {
  await auth.authStateReady();

  const existing = auth.currentUser;
  if (existing) {
    return existing.uid;
  }

  const cred = await signInAnonymously();
  return cred.user.uid;
}
