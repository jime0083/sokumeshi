import { resolveAnonymousUid, AnonymousAuthLike } from '@/src/services/authFlow';

describe('resolveAnonymousUid', () => {
  it('returns the restored user uid without calling signIn when currentUser exists after authStateReady resolves', async () => {
    const auth: AnonymousAuthLike = {
      authStateReady: jest.fn().mockResolvedValue(undefined),
      currentUser: { uid: 'restored-uid' },
    };
    const signIn = jest.fn();

    const uid = await resolveAnonymousUid(auth, signIn);

    expect(uid).toBe('restored-uid');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('calls signIn exactly once and returns its uid when there is no restored user', async () => {
    const auth: AnonymousAuthLike = {
      authStateReady: jest.fn().mockResolvedValue(undefined),
      currentUser: null,
    };
    const signIn = jest.fn().mockResolvedValue({ user: { uid: 'new-uid' } });

    const uid = await resolveAnonymousUid(auth, signIn);

    expect(uid).toBe('new-uid');
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('does not read currentUser before authStateReady resolves, and does not create a new user once it does', async () => {
    let authStateReadyResolved = false;
    let currentUser: { uid: string } | null = null;

    const auth: AnonymousAuthLike = {
      authStateReady: jest.fn(() => {
        return new Promise<void>((resolve) => {
          // authStateReady がまだ解決していない間に currentUser を読んでいないことを
          // 検証するため、解決と同時に復元済みユーザーをセットする
          setTimeout(() => {
            authStateReadyResolved = true;
            currentUser = { uid: 'late-restored-uid' };
            resolve();
          }, 0);
        });
      }),
      get currentUser() {
        if (!authStateReadyResolved) {
          throw new Error('currentUser was read before authStateReady resolved');
        }
        return currentUser;
      },
    };
    const signIn = jest.fn();

    const uid = await resolveAnonymousUid(auth, signIn);

    expect(uid).toBe('late-restored-uid');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('propagates a signIn failure to the caller instead of swallowing it', async () => {
    const auth: AnonymousAuthLike = {
      authStateReady: jest.fn().mockResolvedValue(undefined),
      currentUser: null,
    };
    const signInError = new Error('sign-in failed');
    const signIn = jest.fn().mockRejectedValue(signInError);

    await expect(resolveAnonymousUid(auth, signIn)).rejects.toThrow('sign-in failed');
  });
});
