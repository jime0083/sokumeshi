import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import CardPreview from '@/components/CardPreview';
import { useCardStore } from '@/src/store/cardStore';
import { saveCardImagesAndMeta } from '@/src/services/storage';
import { createShortLink } from '@/src/services/dynamicLinks';
import { ensureAnonymousAuth } from '@/src/services/firebase';
import { setSavedCardMeta } from '@/src/services/saved';

// 1ユーザー1枚: uidをそのままcardIdに

export default function PreviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft } = useCardStore();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const frontRef = useRef<ViewShot>(null);
  const backRef = useRef<ViewShot>(null);

  const onSaveFirebase = async () => {
    if (!draft.templateId || !draft.orientation) return;
    try {
      setSaving(true);
      const frontBase64 = await frontRef.current?.capture?.({ result: 'base64' });
      const backBase64 = await backRef.current?.capture?.({ result: 'base64' });
      if (!frontBase64 || !backBase64) throw new Error('capture failed');
      const uid = await ensureAnonymousAuth();
      const cardId = uid;
      const deep = `https://example.com/card/${cardId}`; // replace by hosted deep link path
      const short = await createShortLink({ link: deep });
      setShortUrl(short);
      const saved = await saveCardImagesAndMeta({
        frontBase64,
        backBase64,
        meta: {
          cardId,
          templateId: draft.templateId,
          orientation: draft.orientation,
          cardName: 'My Card',
          shortUrl: short,
          qrCodeData: short,
          personalInfo: draft.personalInfo,
          socialLinks: draft.socialLinks,
          techStack: draft.techStack,
          careerPortfolio: draft.careerPortfolio,
        },
      });
      await setSavedCardMeta(saved);
      Alert.alert('保存完了', 'Firebaseにアップロードしました');
    } catch (e: any) {
      Alert.alert('エラー', e.message);
    } finally {
      setSaving(false);
    }
  };

  const onSaveToAlbum = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return;
    const front = await frontRef.current?.capture?.({ result: 'tmpfile' });
    const back = await backRef.current?.capture?.({ result: 'tmpfile' });
    if (front) await MediaLibrary.saveToLibraryAsync(front);
    if (back) await MediaLibrary.saveToLibraryAsync(back);
    Alert.alert('保存しました');
  };

  // 共有ボタンは削除（QRは保存後に生成）

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('preview.title')}</Text>

      <View style={{ alignItems: 'center', marginTop: 12 }}>
        {shortUrl ? <QRCode value={shortUrl} size={200} /> : <View style={{ width: 200, height: 200, backgroundColor: '#eee' }} />}
        <Text style={{ marginTop: 8 }}>名刺QRコード(QRコードは保存ボタンタップ後に生成されます)</Text>
      </View>

      {/* 編集ボタンをQRの下に配置し、テンプレート選択へ */}
      <Pressable onPress={() => router.replace('/templates')} style={{ marginTop: 12, backgroundColor: '#90a4ae', padding: 14, borderRadius: 10 }}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>{t('preview.edit')}</Text>
      </Pressable>

      <Text style={{ marginTop: 12, fontWeight: '700' }}>{t('preview.front')}</Text>
      <ViewShot ref={frontRef} options={{ format: 'png', quality: 1 }} style={{ alignItems: 'center', marginTop: 8 }}>
        <CardPreview side="front" />
      </ViewShot>

      <Text style={{ marginTop: 24, fontWeight: '700' }}>{t('preview.back')}</Text>
      <ViewShot ref={backRef} options={{ format: 'png', quality: 1 }} style={{ alignItems: 'center', marginTop: 8 }}>
        <CardPreview side="back" />
      </ViewShot>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <Pressable onPress={onSaveToAlbum} style={{ flex: 1, backgroundColor: '#1e88e5', padding: 14, borderRadius: 10 }}>
          <Text style={{ textAlign: 'center', color: '#fff' }}>{t('preview.save')}</Text>
        </Pressable>
      </View>

      <Pressable onPress={onSaveFirebase} disabled={saving} style={{ marginTop: 12, backgroundColor: '#43a047', padding: 14, borderRadius: 10 }}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>{saving ? '保存中...' : 'Firebaseへ保存'}</Text>
      </Pressable>
    </ScrollView>
  );
}


