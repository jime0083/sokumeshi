import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import CardPreview from '@/components/CardPreview';
import { useCardStore } from '@/src/store/cardStore';
import { saveCardImagesAndMeta } from '@/src/services/storage';
// Dynamic Links 非推奨のため、Firebase Hosting のURLを直接QR化します
import { ensureAnonymousAuth } from '@/src/services/firebase';
import { setSavedCardMeta, getSavedCardMeta } from '@/src/services/saved';
import Constants from 'expo-constants';

// 1ユーザー1枚: uidをそのままcardIdに

export default function PreviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft } = useCardStore();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const frontRef = useRef<ViewShot>(null);
  const backRef = useRef<ViewShot>(null);

  // アプリ再起動時など、保存済みの名刺からQRコードを復元
  useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedCardMeta();
        if (saved?.shortUrl) {
          setShortUrl(saved.shortUrl);
        }
      } catch (e) {
        console.warn('[Preview] 保存済みQRコードの読み込みに失敗しました', e);
      }
    })();
  }, []);

  // TEMP[3-2 measurement]: サイズ計測用。計測後に削除する。
  const [measuring, setMeasuring] = useState(false);
  const runSizeMeasurement = async () => {
    setMeasuring(true);
    try {
      const store = useCardStore.getState();
      store.setPersonalInfo({
        nameJa: '栗田孟太郎田中山田鈴木佐藤',
        nameEn: 'Taro Kuritayamadasuzukisato Example Long',
        jobTitle: 'Individual Developer',
      });
      store.setContact(0, { service: 'twitter', url: 'https://twitter.com/example_very_long_username_1234567890' });
      store.setContact(1, { service: 'instagram', url: 'https://instagram.com/example_very_long_username_1234567890' });
      store.setContact(2, { service: 'github', url: 'https://github.com/example_very_long_username_1234567890' });
      store.setContact(3, { service: 'youtube', url: 'https://youtube.com/@example_very_long_channel_name_1234567890' });
      store.setTechStack({
        languages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Swift', 'Kotlin', 'Ruby', 'PHP', 'C++'],
        frameworks: ['React', 'React Native', 'Next.js', 'Django', 'Flask', 'Express', 'Vue', 'Nuxt', 'Rails', 'Spring'],
      });
      store.setCareerPortfolio(
        '123456789012345678901234567890\n123456789012345678901234567890\n123456789012345678901234567890'
      );
      store.setPortfolioLink(0, 'https://example.com/portfolio/very-long-path-1234567890');
      store.setPortfolioLink(1, 'https://example.com/portfolio/very-long-path-abcdefghij');

      await new Promise((r) => setTimeout(r, 300));

      const templates: { id: string; orientation: 'vertical' | 'horizontal' }[] = [
        { id: 'template_01', orientation: 'vertical' },
        { id: 'template_02', orientation: 'vertical' },
        { id: 'template_03', orientation: 'vertical' },
        { id: 'template_04', orientation: 'horizontal' },
        { id: 'template_05', orientation: 'horizontal' },
        { id: 'template_06', orientation: 'horizontal' },
      ];

      for (const tpl of templates) {
        store.setTemplate(tpl.id, tpl.orientation);
        await new Promise((r) => setTimeout(r, 500));
        const width2x = tpl.orientation === 'vertical' ? 686 : 626;
        const width1x = tpl.orientation === 'vertical' ? 343 : 313;
        const cfgs: { label: string; format: 'png' | 'jpg'; quality: number; width?: number }[] = [
          { label: 'png-q1-native', format: 'png', quality: 1 },
          { label: 'jpg-q0.9-native', format: 'jpg', quality: 0.9 },
          { label: 'jpg-q0.8-native', format: 'jpg', quality: 0.8 },
          { label: 'jpg-q0.7-native', format: 'jpg', quality: 0.7 },
          { label: 'jpg-q0.6-native', format: 'jpg', quality: 0.6 },
          { label: 'jpg-q0.8-2x', format: 'jpg', quality: 0.8, width: width2x },
          { label: 'jpg-q0.7-2x', format: 'jpg', quality: 0.7, width: width2x },
          { label: 'jpg-q0.8-1x', format: 'jpg', quality: 0.8, width: width1x },
        ];
        for (const cfg of cfgs) {
          const opts: any = { result: 'base64', format: cfg.format, quality: cfg.quality };
          if (cfg.width) opts.width = cfg.width;
          const f = await (frontRef.current as any)?.capture?.(opts);
          const b = await (backRef.current as any)?.capture?.(opts);
          const fLen = f?.length ?? 0;
          const bLen = b?.length ?? 0;
          console.log(`MEASURE|${tpl.id}|${cfg.label}|front=${fLen}|back=${bLen}|total=${fLen + bLen}`);
          // 画質確認用に一部の組み合わせを保存する
          if (
            (tpl.id === 'template_01' || tpl.id === 'template_04') &&
            (cfg.label === 'jpg-q0.7-native' || cfg.label === 'jpg-q0.8-2x' || cfg.label === 'jpg-q0.6-native')
          ) {
            if (f) {
              const p = `${FileSystem.documentDirectory}measure_${tpl.id}_${cfg.label}_front.jpg`;
              await FileSystem.writeAsStringAsync(p, f, { encoding: 'base64' });
            }
            if (b) {
              const p = `${FileSystem.documentDirectory}measure_${tpl.id}_${cfg.label}_back.jpg`;
              await FileSystem.writeAsStringAsync(p, b, { encoding: 'base64' });
            }
          }
        }
      }
      console.log('MEASURE|DONE');
      Alert.alert('計測完了', 'ログを確認してください');
    } finally {
      setMeasuring(false);
    }
  };

  const onSaveFirebase = async () => {
    if (!draft.templateId || !draft.orientation) {
      Alert.alert('エラー', 'テンプレートが選択されていません');
      return;
    }
    try {
      setSaving(true);
      console.log('[保存開始] ViewShotでキャプチャ中...');
      
      // ViewShot returns pure base64 (without data url prefix).
      // The uploader side converts it to data URL safely, so base64 here is OK.
      const frontBase64 = await (frontRef.current as any)?.capture?.({ result: 'base64' });
      const backBase64 = await (backRef.current as any)?.capture?.({ result: 'base64' });
      
      if (!frontBase64 || !backBase64) {
        console.error('[エラー] キャプチャ失敗');
        throw new Error('画像のキャプチャに失敗しました');
      }
      console.log('[成功] 画像キャプチャ完了');
      
      console.log('[認証開始] Firebase匿名認証中...');
      const uid = await ensureAnonymousAuth();
      console.log('[認証成功] uid:', uid);
      
      const cardId = uid;
      const hostingDomain = (Constants.expoConfig?.extra as any)?.dynamicLinks?.domain || '';
      const deep = `${String(hostingDomain).replace(/\/$/, '')}/c/${cardId}`;
      const short = deep;
      console.log('[URL生成] 短縮URL:', short);
      
      setShortUrl(deep);
      
      console.log('[アップロード開始] Firebaseに画像とメタデータを保存中...');
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
      console.log('[アップロード成功] メタデータ:', saved);
      
      await setSavedCardMeta(saved);
      console.log('[保存完了] ローカルストレージに保存完了');
      
      Alert.alert('保存完了', 'Firebaseにアップロードしました');
    } catch (e: any) {
      console.error('[保存エラー]', e);
      console.error('[エラー詳細] name:', e.name);
      console.error('[エラー詳細] message:', e.message);
      console.error('[エラー詳細] stack:', e.stack);
      Alert.alert('エラー', `Firebase: Error (${e.code || e.name}).\n${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const onSaveToAlbum = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限エラー', '設定アプリから写真へのアクセスを許可してください。');
        return;
      }

      // 表・裏を base64 PNG としてキャプチャ
      const frontBase64 = await (frontRef.current as any)?.capture?.({
        result: 'base64',
        format: 'png',
        quality: 1,
      });
      const backBase64 = await (backRef.current as any)?.capture?.({
        result: 'base64',
        format: 'png',
        quality: 1,
      });

      if (!frontBase64 && !backBase64) {
        Alert.alert('エラー', '画像のキャプチャに失敗しました。');
        return;
      }

      const tasks: Promise<any>[] = [];

      if (frontBase64) {
        const frontPath = `${FileSystem.cacheDirectory}card_front_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(frontPath, frontBase64, {
          encoding: 'base64',
        });
        tasks.push(MediaLibrary.saveToLibraryAsync(frontPath));
      }

      if (backBase64) {
        const backPath = `${FileSystem.cacheDirectory}card_back_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(backPath, backBase64, {
          encoding: 'base64',
        });
        tasks.push(MediaLibrary.saveToLibraryAsync(backPath));
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      Alert.alert('保存しました', '名刺画像をカメラロールに保存しました。');
    } catch (e) {
      console.error('[アルバム保存エラー]', e);
      Alert.alert('エラー', '画像の保存に失敗しました。');
    }
  };

  // 共有ボタンは削除（QRは保存後に生成）

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>{t('preview.title')}</Text>

      <View style={{ alignItems: 'center', marginTop: 12 }}>
        {shortUrl ? <QRCode value={shortUrl} size={200} /> : <View style={{ width: 200, height: 200, backgroundColor: '#eee' }} />}
        <Text style={{ marginTop: 8 }}>名刺QRコード(QRコードは保存ボタンタップ後に生成されます)</Text>
      </View>

      {/* 編集ボタンをQRの下に配置し、テンプレート選択へ */}
      <Pressable onPress={() => router.replace('/templates')} style={{ marginTop: 12, backgroundColor: '#90a4ae', padding: 14, borderRadius: 10 }}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>{t('preview.edit')}</Text>
      </Pressable>

      <Text style={{ marginTop: 12, fontWeight: '700', color: '#000' }}>{t('preview.front')}</Text>
      <ViewShot
        ref={frontRef}
        options={{ format: 'png', quality: 1, result: 'base64' }}
        style={{ alignItems: 'center', marginTop: 8 }}
      >
        {/* 名刺の周りに薄い影を付けてカード境界をわかりやすくする */}
        <View
          style={{
            padding: 8,
            borderRadius: 16,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <CardPreview side="front" />
        </View>
      </ViewShot>

      <Text style={{ marginTop: 24, fontWeight: '700', color: '#000' }}>{t('preview.back')}</Text>
      <ViewShot
        ref={backRef}
        options={{ format: 'png', quality: 1, result: 'base64' }}
        style={{ alignItems: 'center', marginTop: 8 }}
      >
        <View
          style={{
            padding: 8,
            borderRadius: 16,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <CardPreview side="back" />
        </View>
      </ViewShot>

      {/* TEMP[3-2 measurement] */}
      <Pressable onPress={runSizeMeasurement} disabled={measuring} style={{ marginTop: 12, backgroundColor: '#ff6f00', padding: 14, borderRadius: 10 }}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>{measuring ? '計測中...' : '[TEMP] サイズ計測実行'}</Text>
      </Pressable>

      {/* 保存ボタンの順番：上にFirebase保存（→QR生成）、下にスマホ保存 */}
      <Pressable onPress={onSaveFirebase} disabled={saving} style={{ marginTop: 24, backgroundColor: '#43a047', padding: 14, borderRadius: 10 }}>
        <Text style={{ textAlign: 'center', color: '#fff' }}>{saving ? '保存中...' : '保存'}</Text>
        </Pressable>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Pressable onPress={onSaveToAlbum} style={{ flex: 1, backgroundColor: '#1e88e5', padding: 14, borderRadius: 10 }}>
          <Text style={{ textAlign: 'center', color: '#fff' }}>画像にしてスマホに保存</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}


