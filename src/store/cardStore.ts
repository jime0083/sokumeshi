import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CardMeta, Orientation, PersonalInfo, SocialLinks, TechStack, ContactEntry, ContactService } from '@/src/types/card';

type CardDraft = {
  templateId: string | null;
  orientation: Orientation | null;
  personalInfo: PersonalInfo;
  socialLinks: SocialLinks;
  contacts: ContactEntry[]; // up to 4 entries
  techStack: TechStack;
  careerPortfolio: string;
  portfolioLinks: string[]; // 2 links for QR
};

type CardStore = {
  draft: CardDraft;
  setTemplate: (templateId: string, orientation: Orientation) => void;
  setPersonalInfo: (partial: Partial<PersonalInfo>) => void;
  setSocialLinks: (partial: Partial<SocialLinks>) => void;
  setContact: (index: number, entry: ContactEntry) => void;
  setTechStack: (partial: Partial<TechStack>) => void;
  setCareerPortfolio: (text: string) => void;
  setPortfolioLink: (index: number, url: string) => void;
  reset: () => void;
};

const initialDraft: CardDraft = {
  templateId: null,
  orientation: null,
  personalInfo: { nameJa: '', nameEn: '' },
  socialLinks: {},
  contacts: [
    { service: '', url: '' },
    { service: '', url: '' },
    { service: '', url: '' },
    { service: '', url: '' },
  ],
  techStack: { languages: [], frameworks: [] },
  careerPortfolio: '',
  portfolioLinks: ['', ''],
};

export const useCardStore = create<CardStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setTemplate: (templateId, orientation) =>
        set((s) => ({ draft: { ...s.draft, templateId, orientation } })),
      setPersonalInfo: (partial) =>
        set((s) => ({ draft: { ...s.draft, personalInfo: { ...s.draft.personalInfo, ...partial } } })),
      setSocialLinks: (partial) =>
        set((s) => ({ draft: { ...s.draft, socialLinks: { ...s.draft.socialLinks, ...partial } } })),
      setContact: (index, entry) =>
        set((s) => {
          const contacts = s.draft.contacts.slice(0, 4);
          while (contacts.length < 4) contacts.push({ service: '', url: '' });
          contacts[index] = entry;
          // derive socialLinks from contacts
          const map: SocialLinks = {};
          for (const c of contacts) {
            if (c.service && c.url) {
              (map as any)[c.service] = c.url;
            }
          }
          return { draft: { ...s.draft, contacts, socialLinks: map } };
        }),
      setTechStack: (partial) =>
        set((s) => ({ draft: { ...s.draft, techStack: { ...s.draft.techStack, ...partial } } })),
      setCareerPortfolio: (text) => set((s) => ({ draft: { ...s.draft, careerPortfolio: text } })),
      setPortfolioLink: (index, url) =>
        set((s) => {
          const portfolioLinks = s.draft.portfolioLinks ? [...s.draft.portfolioLinks] : ['', ''];
          while (portfolioLinks.length < 2) portfolioLinks.push('');
          portfolioLinks[index] = url;
          return { draft: { ...s.draft, portfolioLinks } };
        }),
      reset: () => set({ draft: initialDraft }),
    }),
    {
      name: 'quick-card-draft',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (state: any, version) => {
        if (!state) return state;
        const draft = state.draft ?? initialDraft;
        const contacts = Array.isArray(draft.contacts)
          ? draft.contacts
          : [
              { service: '', url: '' },
              { service: '', url: '' },
              { service: '', url: '' },
              { service: '', url: '' },
            ];
        const socialLinks = draft.socialLinks ?? {};
        const portfolioLinks = Array.isArray(draft.portfolioLinks) ? draft.portfolioLinks : ['', ''];
        return {
          ...state,
          draft: {
            ...initialDraft,
            ...draft,
            contacts,
            socialLinks,
            portfolioLinks,
          },
        };
      },
    }
  )
);


