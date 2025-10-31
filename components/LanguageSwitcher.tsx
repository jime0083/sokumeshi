import { View, Text, Pressable } from 'react-native';
import i18n from '@/src/i18n';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(i18n.language);
  const switchLang = () => {
    const next = lang === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(next);
    setLang(next);
  };
  return (
    <Pressable onPress={switchLang} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14 }}>{lang === 'ja' ? '日本語 / English' : 'English / 日本語'}</Text>
    </Pressable>
  );
}


