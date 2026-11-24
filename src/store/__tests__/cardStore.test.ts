import { useCardStore } from '@/src/store/cardStore';
import { ContactEntry } from '@/src/types/card';

describe('cardStore', () => {
  beforeEach(() => {
    useCardStore.getState().reset();
  });

  describe('setContact', () => {
    it('derives socialLinks only from entries that have both service and url', () => {
      useCardStore.getState().setContact(0, { service: 'twitter', url: 'https://twitter.com/me' });
      useCardStore.getState().setContact(1, { service: '', url: 'https://no-service.example.com' });
      useCardStore.getState().setContact(2, { service: 'github', url: '' });

      const { draft } = useCardStore.getState();
      expect(draft.socialLinks).toEqual({ twitter: 'https://twitter.com/me' });
    });

    it('overwrites an existing socialLinks entry when the same service is set again', () => {
      useCardStore.getState().setContact(0, { service: 'github', url: 'https://github.com/old' });
      useCardStore.getState().setContact(0, { service: 'github', url: 'https://github.com/new' });

      expect(useCardStore.getState().draft.socialLinks).toEqual({ github: 'https://github.com/new' });
    });

    it('removes the socialLinks entry when the contact is cleared', () => {
      useCardStore.getState().setContact(0, { service: 'github', url: 'https://github.com/me' });
      useCardStore.getState().setContact(0, { service: '', url: '' });

      expect(useCardStore.getState().draft.socialLinks).toEqual({});
    });

    it('does not change contacts other than the given index', () => {
      const original = useCardStore.getState().draft.contacts;
      useCardStore.getState().setContact(1, { service: 'instagram', url: 'https://instagram.com/me' });

      const { contacts } = useCardStore.getState().draft;
      expect(contacts[0]).toEqual(original[0]);
      expect(contacts[2]).toEqual(original[2]);
      expect(contacts[3]).toEqual(original[3]);
      expect(contacts[1]).toEqual<ContactEntry>({ service: 'instagram', url: 'https://instagram.com/me' });
    });
  });

  describe('setPortfolioLink', () => {
    it('updates only the given index', () => {
      useCardStore.getState().setPortfolioLink(0, 'https://portfolio-a.example.com');
      useCardStore.getState().setPortfolioLink(1, 'https://portfolio-b.example.com');
      useCardStore.getState().setPortfolioLink(0, 'https://portfolio-a2.example.com');

      expect(useCardStore.getState().draft.portfolioLinks).toEqual([
        'https://portfolio-a2.example.com',
        'https://portfolio-b.example.com',
      ]);
    });

    it('pads portfolioLinks to length 2 when the current value is shorter', () => {
      useCardStore.setState((s) => ({ draft: { ...s.draft, portfolioLinks: [] } }));

      useCardStore.getState().setPortfolioLink(1, 'https://portfolio.example.com');

      expect(useCardStore.getState().draft.portfolioLinks).toEqual(['', 'https://portfolio.example.com']);
    });
  });

  describe('migrate', () => {
    const migrate = () => {
      const options = useCardStore.persist.getOptions();
      if (!options.migrate) {
        throw new Error('migrate is not configured');
      }
      return options.migrate;
    };

    it('fills in contacts, socialLinks and portfolioLinks when missing from the persisted state', async () => {
      const legacyState = {
        draft: {
          templateId: 'template-1',
          orientation: 'vertical',
          personalInfo: { nameJa: 'テスト', nameEn: 'Test' },
          techStack: { languages: ['TypeScript'], frameworks: [] },
          careerPortfolio: 'career',
        },
      };

      const migrated: any = await migrate()(legacyState, 1);

      expect(migrated.draft.contacts).toEqual([
        { service: '', url: '' },
        { service: '', url: '' },
        { service: '', url: '' },
        { service: '', url: '' },
      ]);
      expect(migrated.draft.socialLinks).toEqual({});
      expect(migrated.draft.portfolioLinks).toEqual(['', '']);
      expect(migrated.draft.templateId).toBe('template-1');
      expect(migrated.draft.careerPortfolio).toBe('career');
    });

    it('keeps existing contacts, socialLinks and portfolioLinks when already present', async () => {
      const state = {
        draft: {
          templateId: 'template-2',
          orientation: 'horizontal',
          personalInfo: { nameJa: 'テスト2', nameEn: 'Test2' },
          contacts: [{ service: 'email', url: 'me@example.com' }],
          socialLinks: { email: 'me@example.com' },
          portfolioLinks: ['https://a.example.com', 'https://b.example.com'],
          techStack: { languages: [], frameworks: [] },
          careerPortfolio: '',
        },
      };

      const migrated: any = await migrate()(state, 2);

      expect(migrated.draft.contacts).toEqual([{ service: 'email', url: 'me@example.com' }]);
      expect(migrated.draft.socialLinks).toEqual({ email: 'me@example.com' });
      expect(migrated.draft.portfolioLinks).toEqual(['https://a.example.com', 'https://b.example.com']);
    });

    it('returns a falsy state unchanged', async () => {
      const migrated = await migrate()(undefined, 0);
      expect(migrated).toBeUndefined();
    });
  });
});
