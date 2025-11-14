import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('[Firebase初期化] Platform:', Platform.OS);

// Firebase設定（すべてのプラットフォームでWeb用APIキーを使用）
// iOS用APIキーに制限がかかっているため、一時的にWeb用APIキーを使用
const firebaseConfig = {
  apiKey: "AIzaSyAJEPTKaZy7SATjujYXaavZRC7f64wElAY",  // Web用APIキー（制限なし）
  authDomain: "sokumeshi-58f06.firebaseapp.com",
  projectId: "sokumeshi-58f06",
  storageBucket: "sokumeshi-58f06.firebasestorage.app",
  messagingSenderId: "379655181547",
  appId: Platform.OS === 'ios'
    ? "1:379655181547:ios:dda30561dfcf4987379aae"  // iOS用App ID
    : Platform.OS === 'android'
    ? "YOUR_ANDROID_APP_ID"  // Android用App ID
    : "1:379655181547:web:66af2a6c445243b3379aae"  // Web用App ID
};

console.log('[Firebase初期化] 設定:', {
  platform: Platform.OS,
  apiKey: firebaseConfig.apiKey.substring(0, 20) + '...',
  projectId: firebaseConfig.projectId
});

const firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

let authInstance = getApps().length ? getAuth(firebaseApp) : undefined;

if (!authInstance && Platform.OS !== 'web') {
  try {
    authInstance = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('[Firebase初期化] React Native向けAuthを初期化しました');
  } catch (error) {
    console.warn('[Firebase初期化] initializeAuth 失敗のため getAuth にフォールバックします', error);
    authInstance = getAuth(firebaseApp);
  }
}

export const app = firebaseApp;
export const auth = authInstance ?? getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

console.log('[Firebase初期化] 完了');

export async function ensureAnonymousAuth(): Promise<string> {
  console.log('[認証] 現在のユーザー確認中...');
  console.log('[認証デバッグ] auth.config:', {
    apiKey: auth.config.apiKey?.substring(0, 20) + '...',
    authDomain: auth.config.authDomain
  });

  const existing = auth.currentUser;
  if (existing) {
    console.log('[認証] 既存ユーザーあり:', existing.uid);
    return existing.uid;
  }

  console.log('[認証] 匿名ログイン開始...');
  console.log('[認証デバッグ] 手動 API 呼び出し開始');
  try {
    const manualResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity',
        'X-Firebase-Client': 'iOS/17 react-native',
        'X-Client-Version': 'iOS/FirebaseSDK/10.11.0'
      },
      body: JSON.stringify({ returnSecureToken: true })
    });
    const manualText = await manualResp.text();
    console.log('[認証デバッグ] 手動 API status:', manualResp.status);
    console.log('[認証デバッグ] 手動 API headers:', Array.from(manualResp.headers.entries()));
    console.log('[認証デバッグ] 手動 API ボディ先頭200文字:', manualText.slice(0, 200));
  } catch (manualError) {
    console.error('[認証デバッグ] 手動 API 呼び出し失敗', manualError);
  }

  try {
  const cred = await signInAnonymously(auth);
    console.log('[認証成功] 匿名ログイン完了:', cred.user.uid);
    console.log('[認証成功] ユーザー情報:', {
      uid: cred.user.uid,
      isAnonymous: cred.user.isAnonymous
    });
  return cred.user.uid;
  } catch (error: any) {
    console.error('[認証エラー]', error);
    console.error('[認証エラー詳細] code:', error.code);
    console.error('[認証エラー詳細] message:', error.message);

    // customDataの詳細を確認
    if (error.customData) {
      console.error('[認証エラー詳細] customData.message:', error.customData.message);
      console.error('[認証エラー詳細] customData:', JSON.stringify(error.customData, null, 2));
    }

    // ネットワークテスト
    console.log('[認証デバッグ] ネットワーク接続テスト開始...');
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      console.log('[認証デバッグ] Google接続: OK (status:', response.status, ')');
    } catch (netError) {
      console.error('[認証デバッグ] Google接続: 失敗', netError);
    }

    throw error;
  }
}


