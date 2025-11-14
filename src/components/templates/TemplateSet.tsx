import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
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
  const id = templateIdFromIdStr(props.templateId);
  if (id >= 4 && id <= 6) {
    return <FrontH {...props} />;
  }
      return <Front1 {...props} />;
}

export function BackTemplate(props: Props & { careerPortfolio?: string; portfolioLinks?: string[] }) {
  const id = templateIdFromIdStr(props.templateId);
  if (id >= 4 && id <= 6) {
    return <BackH {...props} />;
  }
      return <Back1 {...props} />;
}

function Front1({ orientation, personalInfo, socialLinks, contacts, templateId }: Props) {
  const id = templateIdFromIdStr(templateId);
  const frontBg = getFrontBackgroundByTemplateId(id);
  return (
    <CardContainer orientation={orientation}>
      <ImageBackground source={frontBg} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ alignItems: 'center', marginTop: 80 }}>
          {personalInfo.profileImage ? (
            <Image source={{ uri: personalInfo.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
          )}
          <Text style={styles.nameJa}>{personalInfo.nameJa}</Text>
          <Text style={styles.nameEn}>{personalInfo.nameEn}</Text>
          {personalInfo.jobTitle ? (
            <Text
              style={[
                styles.job,
                styles.jobLarge, // テンプレート1〜3では職業の文字サイズを1.5倍に
                id === 2 ? { marginTop: 18 } : null, // テンプレート2のみ職業の上に 10px 追加
              ]}
            >
              {personalInfo.jobTitle}
            </Text>
          ) : null}
        </View>
        {/* Social icons + QR in 2x2 pairs with 20px top space */}
        <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
          <View style={{ height: 1, backgroundColor: '#ddd' }} />
          {chunkPairs(Object.entries(socialLinks).filter(([_, url]) => !!url).slice(0, 4)).map((row, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              {row.map(([key, url]) => (
                <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '48%' }}>
                  {key in SOCIAL_ICON ? (
                    <Image source={(SOCIAL_ICON as any)[key]} style={{ width: 56, height: 56 }} />
                  ) : null}
                  <QRCode value={String(url)} size={60} />
                </View>
              ))}
              {row.length === 1 ? <View style={{ width: '48%' }} /> : null}
            </View>
          ))}
      </View>
      </ImageBackground>
    </CardContainer>
  );
}

function Back1({ orientation, techStack, careerPortfolio, portfolioLinks, templateId }: Props & { careerPortfolio?: string; portfolioLinks?: string[] }) {
  const id = templateIdFromIdStr(templateId);
  const backBg = getBackBackgroundByTemplateId(id);
  return (
    <CardContainer orientation={orientation}>
      <ImageBackground source={backBg} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1, padding: 16 }}>
          <Text style={[styles.sectionTitle, { marginTop: 50 }]}>言語・スキル</Text>
        <Text style={styles.text}>{techStack.languages.join(', ')}</Text>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>FW(フレームワーク)</Text>
        <Text style={styles.text}>{techStack.frameworks.join(', ')}</Text>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>経歴</Text>
          {careerPortfolio ? <Text style={styles.text}>{careerPortfolio}</Text> : null}

          {((portfolioLinks || []).filter(Boolean).length > 0) ? (
          <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>ポートフォリオ</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 16, marginTop: 12 }}>
                {(portfolioLinks || []).filter(Boolean).slice(0,2).map((url, idx) => (
                  <QRCode key={idx} value={String(url)} size={64} />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ImageBackground>
    </CardContainer>
  );
}

// Horizontal templates (4-6): distinct layout
function FrontH({ orientation, personalInfo, socialLinks, templateId }: Props) {
  const tId = templateIdFromIdStr(templateId);
  const frontBg = getFrontBackgroundByTemplateId(tId);
  const isT5 = tId === 5;
  return (
    <CardContainer orientation={orientation}>
      <ImageBackground source={frontBg} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, transform: [{ translateX: -10 }] }}>
          {/* Left: avatar + names */}
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 30 }}>
            {personalInfo.profileImage ? (
              <Image source={{ uri: personalInfo.profileImage }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' }} />
            ) : (
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd' }} />
            )}
            <Text style={[styles.nameJa, { marginTop: 8, textAlign: 'center' }]}>{personalInfo.nameJa}</Text>
            <Text style={[styles.nameEn, { textAlign: 'center', fontSize: 10, color: isT5 ? '#000' : undefined }]}>{personalInfo.nameEn}</Text>
            {personalInfo.jobTitle ? (
              <Text style={[styles.job, { marginTop: 6, textAlign: 'center', color: isT5 ? '#FFFFFF' : undefined }]}>
                {personalInfo.jobTitle}
              </Text>
            ) : null}
          </View>

          {/* Right: social icons + QR (2x2 pairs) */}
          <View style={{ flex: 1, paddingLeft: 22 }}>
            <View style={{ marginTop: 40 }} />
            {chunkPairs(Object.entries(socialLinks).filter(([_, url]) => !!url).slice(0, 4)).map((row, idx) => (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                {row.map(([key, url]) => (
                  <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '48%' }}>
                    {key in SOCIAL_ICON ? (
                      <Image source={(SOCIAL_ICON as any)[key]} style={{ width: 20, height: 20 }} />
                    ) : null}
                    <QRCode value={String(url)} size={20} />
                  </View>
                ))}
                {row.length === 1 ? <View style={{ width: '48%' }} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </CardContainer>
  );
}

function BackH({ orientation, techStack, careerPortfolio, portfolioLinks, templateId }: Props & { careerPortfolio?: string; portfolioLinks?: string[] }) {
  const id = templateIdFromIdStr(templateId);
  const backBg = getBackBackgroundByTemplateId(id);
  const isT5 = id === 5;
  const headingColor = isT5 ? '#FF4D85' : undefined;
  const bodyColor = isT5 ? '#FFFFFF' : undefined;
  return (
    <CardContainer orientation={orientation}>
      <ImageBackground source={backBg} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, flexDirection: 'row', padding: 16 }}>
          {/* Left: language, FW, portfolio */}
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: styles.sectionTitle.fontSize / 2 as any, color: headingColor }]}>言語・スキル</Text>
            <Text style={[styles.text, { fontSize: styles.text.fontSize / 2 as any, color: bodyColor }]}>{techStack.languages.join(', ')}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: styles.sectionTitle.fontSize / 2 as any, color: headingColor }]}>FW(フレームワーク)</Text>
            <Text style={[styles.text, { fontSize: styles.text.fontSize / 2 as any, color: bodyColor }]}>{techStack.frameworks.join(', ')}</Text>
            {((portfolioLinks || []).filter(Boolean).length > 0) ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: styles.sectionTitle.fontSize / 2 as any, color: headingColor }]}>ポートフォリオ</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12, marginTop: 10 }}>
                  {(portfolioLinks || []).filter(Boolean).slice(0,2).map((url, idx) => (
                    <QRCode key={idx} value={String(url)} size={28} />
                  ))}
                </View>
          </>
        ) : null}
      </View>

          {/* Right: career */}
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: styles.sectionTitle.fontSize / 2 as any, color: headingColor }]}>経歴</Text>
            {careerPortfolio ? <Text style={[styles.text, { fontSize: styles.text.fontSize / 2 as any, color: bodyColor }]}>{careerPortfolio}</Text> : null}
          </View>
        </View>
      </ImageBackground>
    </CardContainer>
  );
}

function templateIdFromIdStr(id?: string): number {
  if (!id) return 1;
  const m = id.match(/(\d+)/);
  return m ? Number(m[1]) : 1;
}

const FRONT_BG: Record<number, any> = {
  1: require('@/assets/images/templates/vertical/1.png'),
  2: require('@/assets/images/templates/vertical/2.png'),
  3: require('@/assets/images/templates/vertical/3.png'),
  4: require('@/assets/images/templates/horizontal/4.png'),
  5: require('@/assets/images/templates/horizontal/5.png'),
  6: require('@/assets/images/templates/horizontal/6.png'),
};

const BACK_BG = {
  vertical1: require('@/assets/images/templates/vertical/裏1.png'),
  horizontal3: require('@/assets/images/templates/horizontal/裏3.png'),
  horizontal4: require('@/assets/images/templates/horizontal/裏4.png'),
};

function getFrontBackgroundByTemplateId(id: number) {
  return FRONT_BG[id] ?? FRONT_BG[1];
}

function getBackBackgroundByTemplateId(id: number) {
  if (id >= 1 && id <= 3) return BACK_BG.vertical1;
  if (id === 5) return BACK_BG.horizontal4;
  if (id === 4 || id === 6) return BACK_BG.horizontal3;
  return BACK_BG.vertical1;
}

function chunkPairs<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
}

const styles = StyleSheet.create({
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#fff' },
  nameJa: { marginTop: 12, fontSize: 20, fontWeight: '600' },
  nameEn: { marginTop: 4, fontSize: 14, color: '#666' },
  job: { marginTop: 8, fontSize: 14, color: '#e53935' },
  jobLarge: { fontSize: 18 }, // テンプレート1〜3用（従来14ptの1.5倍）
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1565c0' },
  text: { fontSize: 14, color: '#333' },
});


