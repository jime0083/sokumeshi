import { View } from 'react-native';
import { useCardStore } from '@/src/store/cardStore';
import { FrontTemplate, BackTemplate } from '@/src/components/templates/TemplateSet';

export default function CardPreview() {
  const { draft } = useCardStore();
  if (!draft.templateId || !draft.orientation) return null;
  return (
    <View style={{ gap: 24, alignItems: 'center' }}>
      <FrontTemplate
        orientation={draft.orientation}
        templateId={draft.templateId}
        personalInfo={draft.personalInfo}
        socialLinks={draft.socialLinks}
        techStack={draft.techStack}
        contacts={draft.contacts}
      />
      <BackTemplate
        orientation={draft.orientation}
        templateId={draft.templateId}
        personalInfo={draft.personalInfo}
        socialLinks={draft.socialLinks}
        techStack={draft.techStack}
        careerPortfolio={draft.careerPortfolio}
      />
    </View>
  );
}


