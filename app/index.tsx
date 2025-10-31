import { Redirect, useRootNavigationState } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getSavedCardMeta } from '@/src/services/saved';

export default function HomeScreen() {
  const { t } = useTranslation();
  const rootState = useRootNavigationState();
  const [dest, setDest] = useState<'qr' | 'templates' | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getSavedCardMeta();
      setDest(saved?.shortUrl ? 'qr' : 'templates');
    })();
  }, []);
  if (!rootState?.key || !dest) {
    return (
      <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{t('appTitle')}</Text>
          <LanguageSwitcher />
        </View>
      </View>
    );
  }
  return <Redirect href={`/${dest}`} />;
}


