import { View } from 'react-native';
import { useCardStore } from '@/src/store/cardStore';
import { FrontTemplate, BackTemplate } from '@/src/components/templates/TemplateSet';

export default function CardPreview({ side }: { side: 'front' | 'back' }) {
  const { draft } = useCardStore();
  if (!draft.templateId || !draft.orientation) return null;
  if (side === 'front') {
    return (
      <View style={{ alignItems: 'center' }}>
        <FrontTemplate
          orientation={draft.orientation}
          templateId={draft.templateId}
          personalInfo={draft.personalInfo}
          socialLinks={draft.socialLinks}
          techStack={draft.techStack}
          contacts={draft.contacts}
        />
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center' }}>
      <BackTemplate
        orientation={draft.orientation}
        templateId={draft.templateId}
        personalInfo={draft.personalInfo}
        socialLinks={draft.socialLinks}
        techStack={draft.techStack}
        careerPortfolio={draft.careerPortfolio}
        portfolioLinks={draft.portfolioLinks}
      />
    </View>
  );
}


