import { View, Text, TextInput, Pressable, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useCardStore } from '@/src/store/cardStore';
import { ContactEntry, ContactService } from '@/src/types/card';

const SERVICE_OPTIONS: { key: ContactService; label: string }[] = [
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'Tiktok' },
  { key: 'youtube', label: 'Youtube' },
  { key: 'github', label: 'Github' },
  { key: 'email', label: 'Mail' },
];

export default function FrontFormScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { draft, setPersonalInfo, setContact } = useCardStore();
  const [jobModal, setJobModal] = React.useState(false as boolean);
  const [serviceModal, setServiceModal] = React.useState<{ open: boolean; index: number | null }>({ open: false, index: null });

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, base64: false });
    if (!res.canceled) {
      setPersonalInfo({ profileImage: res.assets[0].uri });
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('frontForm.title')}</Text>

      <Pressable onPress={pickImage} style={{ marginTop: 12, alignItems: 'center' }}>
        {draft.personalInfo.profileImage ? (
          <Image source={{ uri: draft.personalInfo.profileImage }} style={{ width: 96, height: 96, borderRadius: 48 }} />
        ) : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#ddd' }} />
        )}
        <Text style={{ marginTop: 8, color: '#1e88e5' }}>{t('frontForm.pickFromLibrary')}</Text>
      </Pressable>

      <TextInput
        placeholder={t('frontForm.nameJa')}
        value={draft.personalInfo.nameJa}
        onChangeText={(v) => setPersonalInfo({ nameJa: v })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 16 }}
      />
      <TextInput
        placeholder={t('frontForm.nameEn')}
        value={draft.personalInfo.nameEn}
        onChangeText={(v) => setPersonalInfo({ nameEn: v })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 12 }}
      />
      <Text style={{ marginTop: 12, fontWeight: '600' }}>{t('frontForm.jobTitle')}</Text>
      <Pressable onPress={() => setJobModal(true)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 6 }}>
        <Text>{draft.personalInfo.jobTitle || '選択してください'}</Text>
      </Pressable>

      <Text style={{ marginTop: 16, fontWeight: '700' }}>SNS・連絡先</Text>
      {[0, 1, 2, 3].map((idx) => {
        const entry = draft.contacts[idx] || { service: '', url: '' };
        return (
          <View key={idx} style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => setServiceModal({ open: true, index: idx })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }}
            >
              <Text>{entry.service ? SERVICE_OPTIONS.find((o) => o.key === entry.service)?.label : 'サービスを選択'}</Text>
            </Pressable>
            <TextInput
              placeholder="URL または mailto:"
              value={entry.url}
              onChangeText={(v) => setContact(idx, { ...entry, url: v })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );
      })}

      <Pressable onPress={() => router.push('/back')} style={{ backgroundColor: '#1e88e5', padding: 16, borderRadius: 12, marginTop: 24 }}>
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>{t('frontForm.next')}</Text>
      </Pressable>

      {/* Job modal */}
      <Modal transparent visible={jobModal} animationType="fade" onRequestClose={() => setJobModal(false)}>
        <Pressable onPress={() => setJobModal(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 260, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => { setPersonalInfo({ jobTitle: 'Engineer' }); setJobModal(false); }} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text>エンジニア</Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: '#eee' }} />
            <Pressable onPress={() => { setPersonalInfo({ jobTitle: 'Individual Developer' }); setJobModal(false); }} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text>個人開発者</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Service modal */}
      <Modal transparent visible={serviceModal.open} animationType="fade" onRequestClose={() => setServiceModal({ open: false, index: null })}>
        <Pressable onPress={() => setServiceModal({ open: false, index: null })} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 280, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            {SERVICE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => {
                  if (serviceModal.index != null) {
                    const current = draft.contacts[serviceModal.index] || { service: '', url: '' };
                    setContact(serviceModal.index, { ...current, service: opt.key });
                  }
                  setServiceModal({ open: false, index: null });
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 16 }}
              >
                <Text>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}


