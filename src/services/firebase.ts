import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shouldUseEmulator } from './emulatorConfig';
import { resolveAnonymousUid } from './authFlow';

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

if (shouldUseEmulator(__DEV__, process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR)) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

console.log('[Firebase初期化] 完了');

export async function ensureAnonymousAuth(): Promise<string> {
  return resolveAnonymousUid(auth, () => signInAnonymously(auth));
}


