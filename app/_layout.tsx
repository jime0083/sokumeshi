import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { LogBox } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { initializeI18n } from '@/src/i18n';
import { useCardStore } from '@/src/store/cardStore';
import { migrateLegacyProfileImage } from '@/src/services/profileImage';

// 既存ユーザーの旧形式(絶対パス)のプロフィール写真を documentDirectory/profile/ へ移行する(requirements.md §4.3)。
// zustand persist の復元(hydration)完了後に1回だけ実行する。
async function migrateProfileImageIfNeeded() {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) return;

  const { draft, setPersonalInfo } = useCardStore.getState();
  const migrated = await migrateLegacyProfileImage({
    value: draft.personalInfo.profileImage,
    documentDirectory,
  });

  if (migrated !== draft.personalInfo.profileImage) {
    setPersonalInfo({ profileImage: migrated });
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // i18n 初期化
    initializeI18n();

    // 開発時の画面下部の警告バナーを非表示にする
    LogBox.ignoreAllLogs();

    if (useCardStore.persist.hasHydrated()) {
      migrateProfileImageIfNeeded();
      return;
    }
    return useCardStore.persist.onFinishHydration(() => {
      migrateProfileImageIfNeeded();
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="templates" options={{ title: 'Templates' }} />
        <Stack.Screen name="front" options={{ title: 'Front' }} />
        <Stack.Screen name="back" options={{ title: 'Back' }} />
        <Stack.Screen name="preview" options={{ title: 'Preview' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
