import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getSavedCardMeta } from '@/src/services/saved';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

export default function QRScreen() {
  const [url, setUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const saved = await getSavedCardMeta();
      if (saved?.shortUrl) setUrl(saved.shortUrl);
      else router.replace('/templates');
    })();
  }, []);

  const copy = async () => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    Alert.alert('コピーしました');
  };

  const share = async () => {
    if (!url || !(await Sharing.isAvailableAsync())) return copy();
    await Sharing.shareAsync(undefined, { dialogTitle: '名刺リンク', UTI: url });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {url ? (
        <>
          <QRCode value={url} size={220} />
          <Text style={{ marginTop: 12 }}>{url}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable onPress={copy} style={{ backgroundColor: '#90a4ae', padding: 12, borderRadius: 10 }}>
              <Text style={{ color: '#fff' }}>コピー</Text>
            </Pressable>
            <Pressable onPress={share} style={{ backgroundColor: '#1e88e5', padding: 12, borderRadius: 10 }}>
              <Text style={{ color: '#fff' }}>共有</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Text>Loading…</Text>
      )}
    </View>
  );
}


