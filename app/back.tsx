import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useCardStore } from '@/src/store/cardStore';

export default function BackFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, setTechStack, setCareerPortfolio, setPortfolioLink } = useCardStore();
  const [careerLines, setCareerLines] = useState<string[]>(['', '', '']);

  useEffect(() => {
    const lines = (draft.careerPortfolio || '').split('\n').slice(0, 3);
    while (lines.length < 3) lines.push('');
    setCareerLines(lines);
  }, []);

  const updateCareer = (index: number, value: string) => {
    const trimmed = value.slice(0, 30);
    const lines = [...careerLines];
    lines[index] = trimmed;
    setCareerLines(lines);
    setCareerPortfolio(lines.join('\n'));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{t('backForm.title')}</Text>

      <Text style={{ marginTop: 12, fontWeight: '600', color: '#fff' }}>{t('backForm.languages')}</Text>
      <TextInput
        placeholder="JavaScript, TypeScript, Python"
        value={draft.techStack.languages.join(', ')}
        onChangeText={(v) => setTechStack({ languages: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: '#fff', color: '#000' }}
        placeholderTextColor="#666"
      />

      <Text style={{ marginTop: 12, fontWeight: '600', color: '#fff' }}>{t('backForm.frameworks')}</Text>
      <TextInput
        placeholder="React, React Native, Django"
        value={draft.techStack.frameworks.join(', ')}
        onChangeText={(v) => setTechStack({ frameworks: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: '#fff', color: '#000' }}
        placeholderTextColor="#666"
      />

      <Text style={{ marginTop: 12, fontWeight: '600', color: '#fff' }}>{t('backForm.career')}</Text>
      {[0,1,2].map((i) => (
        <TextInput
          key={i}
          placeholder="30文字程度"
          value={careerLines[i]}
          onChangeText={(v) => updateCareer(i, v)}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: i === 0 ? 8 : 10, backgroundColor: '#fff', color: '#000' }}
          placeholderTextColor="#666"
        />
      ))}

      <Text style={{ marginTop: 16, fontWeight: '600', color: '#fff' }}>ポートフォリオ</Text>
      {[0,1].map((i) => (
      <TextInput
          key={`p-${i}`}
          placeholder="URL"
          value={(draft.portfolioLinks && draft.portfolioLinks[i]) || ''}
          onChangeText={(v) => setPortfolioLink(i, v)}
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: i === 0 ? 8 : 10, backgroundColor: '#fff', color: '#000' }}
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
      />
      ))}

      <Pressable onPress={() => router.push('/preview')} style={{ backgroundColor: '#1e88e5', padding: 16, borderRadius: 12, marginTop: 24 }}>
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>{t('backForm.create')}</Text>
      </Pressable>
    </ScrollView>
  );
}


