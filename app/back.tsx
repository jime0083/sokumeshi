import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useCardStore } from '@/src/store/cardStore';

export default function BackFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, setTechStack, setCareerPortfolio } = useCardStore();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('backForm.title')}</Text>

      <Text style={{ marginTop: 12, fontWeight: '600' }}>{t('backForm.languages')}</Text>
      <TextInput
        placeholder="JavaScript, TypeScript, Python"
        value={draft.techStack.languages.join(', ')}
        onChangeText={(v) => setTechStack({ languages: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8 }}
      />

      <Text style={{ marginTop: 12, fontWeight: '600' }}>{t('backForm.frameworks')}</Text>
      <TextInput
        placeholder="React, React Native, Django"
        value={draft.techStack.frameworks.join(', ')}
        onChangeText={(v) => setTechStack({ frameworks: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8 }}
      />

      <Text style={{ marginTop: 12, fontWeight: '600' }}>{t('backForm.career')}</Text>
      <TextInput
        placeholder="500文字まで"
        value={draft.careerPortfolio}
        onChangeText={(v) => setCareerPortfolio(v.slice(0, 500))}
        multiline
        numberOfLines={6}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8, height: 140, textAlignVertical: 'top' }}
      />

      <Pressable onPress={() => router.push('/preview')} style={{ backgroundColor: '#1e88e5', padding: 16, borderRadius: 12, marginTop: 24 }}>
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>{t('backForm.create')}</Text>
      </Pressable>
    </View>
  );
}


