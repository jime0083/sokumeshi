import { View, Text, Image, StyleSheet } from 'react-native';
import { CardContainer } from './common';
import { Orientation, PersonalInfo, SocialLinks, TechStack, ContactEntry } from '@/src/types/card';
import { SOCIAL_ICON } from '@/src/assets/socialIcons';
import QRCode from 'react-native-qrcode-svg';

type Props = {
  orientation: Orientation;
  templateId: string;
  personalInfo: PersonalInfo;
  socialLinks: SocialLinks;
  techStack: TechStack;
  contacts?: ContactEntry[];
};

export function FrontTemplate(props: Props) {
  const { templateId } = props;
  switch (templateId) {
    case 'template_01':
    default:
      return <Front1 {...props} />;
  }
}

export function BackTemplate(props: Props & { careerPortfolio?: string }) {
  const { templateId } = props;
  switch (templateId) {
    case 'template_01':
    default:
      return <Back1 {...props} />;
  }
}

function Front1({ orientation, personalInfo, socialLinks, contacts }: Props) {
  return (
    <CardContainer orientation={orientation}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 120, backgroundColor: '#e3f2fd' }} />
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          {personalInfo.profileImage ? (
            <Image source={{ uri: personalInfo.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
          )}
          <Text style={styles.nameJa}>{personalInfo.nameJa}</Text>
          <Text style={styles.nameEn}>{personalInfo.nameEn}</Text>
          {personalInfo.jobTitle ? <Text style={styles.job}>{personalInfo.jobTitle}</Text> : null}
        </View>

        {/* Social icons + QR grid */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <View style={{ height: 1, backgroundColor: '#ddd' }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 }}>
            {Object.entries(socialLinks)
              .filter(([_, url]) => !!url)
              .slice(0, 6)
              .map(([key, url]) => (
                <View key={key} style={{ width: '30%', alignItems: 'center', marginBottom: 12 }}>
                  {/* icon */}
                  {key in SOCIAL_ICON ? (
                    <Image source={(SOCIAL_ICON as any)[key]} style={{ width: 36, height: 36, marginBottom: 6 }} />
                  ) : null}
                  {/* QR */}
                  <QRCode value={String(url)} size={64} />
                </View>
              ))}
          </View>
        </View>
      </View>
    </CardContainer>
  );
}

function Back1({ orientation, techStack, careerPortfolio }: Props & { careerPortfolio?: string }) {
  return (
    <CardContainer orientation={orientation}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.sectionTitle}>言語・スキル</Text>
        <Text style={styles.text}>{techStack.languages.join(', ')}</Text>
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>FW(フレームワーク)</Text>
        <Text style={styles.text}>{techStack.frameworks.join(', ')}</Text>
        {careerPortfolio ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>ポートフォリオ</Text>
            <Text style={styles.text}>{careerPortfolio}</Text>
          </>
        ) : null}
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#fff' },
  nameJa: { marginTop: 12, fontSize: 20, fontWeight: '600' },
  nameEn: { marginTop: 4, fontSize: 14, color: '#666' },
  job: { marginTop: 8, fontSize: 14, color: '#e53935' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1565c0' },
  text: { fontSize: 14, color: '#333' },
});


