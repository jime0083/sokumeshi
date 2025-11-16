import { Redirect, useRootNavigationState } from 'expo-router';
import { View, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { getSavedCardMeta } from '@/src/services/saved';

const loadingGif = require('@/assets/images/icons/social/loading.gif');

export default function HomeScreen() {
  const rootState = useRootNavigationState();
  const [dest, setDest] = useState<'preview' | 'templates' | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getSavedCardMeta();
      setDest(saved?.shortUrl ? 'preview' : 'templates');
    })();
  }, []);
  if (!rootState?.key || !dest) {
    // ルートナビゲーションや保存データの判定中はローディングアニメーションを表示
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000', // GIF が目立つよう黒背景に
        }}
      >
        <Image
          source={loadingGif}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
      </View>
    );
  }
  return <Redirect href={`/${dest}`} />;
}


