import { View, Text, Pressable, ScrollView, Image, Modal } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/i18n';
import { useRouter } from 'expo-router';
import { useCardStore } from '@/src/store/cardStore';

const templates = [
  {
    id: 'template_01',
    name: 'テンプレート1',
    orientation: 'vertical' as const,
    image: require('@/assets/images/templates/vertical/1.png'),
  },
  {
    id: 'template_02',
    name: 'テンプレート2',
    orientation: 'vertical' as const,
    image: require('@/assets/images/templates/vertical/2.png'),
  },
  {
    id: 'template_03',
    name: 'テンプレート3',
    orientation: 'vertical' as const,
    image: require('@/assets/images/templates/vertical/3.png'),
  },
  {
    id: 'template_04',
    name: 'テンプレート4',
    orientation: 'horizontal' as const,
    image: require('@/assets/images/templates/horizontal/4.png'),
  },
  {
    id: 'template_05',
    name: 'テンプレート5',
    orientation: 'horizontal' as const,
    image: require('@/assets/images/templates/horizontal/5.png'),
  },
  {
    id: 'template_06',
    name: 'テンプレート6',
    orientation: 'horizontal' as const,
    image: require('@/assets/images/templates/horizontal/6.png'),
  },
];

export default function TemplateSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setTemplate = useCardStore((s) => s.setTemplate);
  const [langModal, setLangModal] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('templateSelect.title')}</Text>
        <Pressable onPress={() => setLangModal(true)} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e88e5', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Language ▾</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}>
        {templates.map((tpl, idx) => {
        // 縦テンプレ1〜3は背景付き＋実寸20%で中央に"contain"表示
        const isVerticalMini = idx <= 2; // 0,1,2 -> テンプレ1~3
        const cardSize = tpl.orientation === 'vertical' ? { w: 343, h: 570 } : { w: 313, h: 189 };
        const scale = isVerticalMini ? 0.2 : 1; // 1~3のみ20%
        const imgStyle = isVerticalMini
          ? { width: cardSize.w * scale, height: cardSize.h * scale, resizeMode: 'contain' as const }
          : { width: '100%', height: 140, resizeMode: 'cover' as const };
        const wrapperStyle = isVerticalMini
          ? { backgroundColor: '#eef2f7', paddingVertical: 16, alignItems: 'center' as const }
          : { borderRadius: 10, overflow: 'hidden' };

          return (
        <Pressable
          key={tpl.id}
              style={{ backgroundColor: '#f5f5f5', padding: 10, marginBottom: 12, borderRadius: 12 }}
          onPress={() => {
            setTemplate(tpl.id, tpl.orientation);
            router.push('/front');
          }}
        >
              <View style={wrapperStyle}>
                <Image source={tpl.image} style={imgStyle as any} />
              </View>
              <Text style={{ marginTop: 8, marginLeft: 4, fontWeight: '600' }}>{tpl.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal visible={langModal} transparent animationType="fade" onRequestClose={() => setLangModal(false)}>
        <Pressable onPress={() => setLangModal(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 260, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => { i18n.changeLanguage('ja'); setLangModal(false); }} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16 }}>日本語</Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: '#eee' }} />
            <Pressable onPress={() => { i18n.changeLanguage('en'); setLangModal(false); }} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16 }}>English</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}


