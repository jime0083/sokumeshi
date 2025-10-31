import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { initializeI18n } from '@/src/i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeI18n();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="templates" options={{ title: 'Templates' }} />
        <Stack.Screen name="front" options={{ title: 'Front' }} />
        <Stack.Screen name="back" options={{ title: 'Back' }} />
        <Stack.Screen name="preview" options={{ title: 'Preview' }} />
        <Stack.Screen name="qr" options={{ title: 'QR' }} />
        <Stack.Screen name="scanner" options={{ title: 'Scan QR' }} />
        <Stack.Screen name="card/[cardId]" options={{ title: 'Card' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
