import { useEffect, useState } from 'react';
import { Text, View, Linking, Platform } from 'react-native';

type ScannerModule = typeof import('expo-barcode-scanner');

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [BarCodeScanner, setBarCodeScanner] = useState<ScannerModule['BarCodeScanner'] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 動的インポートして、モジュール未リンク時のクラッシュを回避
        const mod: ScannerModule = await import('expo-barcode-scanner');
        setBarCodeScanner(() => mod.BarCodeScanner);
        const { status } = await mod.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (e) {
        // Webや未リンク環境ではスキャナを無効化
        setHasPermission(false);
      }
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission…</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {BarCodeScanner ? (
        <BarCodeScanner
          onBarCodeScanned={({ data }: any) => {
            if (scanned) return;
            setScanned(true);
            Linking.openURL(data);
          }}
          style={{ flex: 1 }}
        />
      ) : (
        <Text>Loading scanner…</Text>
      )}
    </View>
  );
}


