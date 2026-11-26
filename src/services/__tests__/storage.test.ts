import { doc, getDocs, deleteDoc, query, setDoc } from 'firebase/firestore';
import { saveCardImagesAndMeta } from '@/src/services/storage';
import { ensureAnonymousAuth } from '@/src/services/firebase';
import { MAX_TOTAL_BASE64, ImageTooLargeError } from '@/src/services/cardImage';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db, collectionName, id) => ({ __collection: collectionName, __id: id })),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  collection: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

jest.mock('@/src/services/firebase', () => ({
  db: {},
  ensureAnonymousAuth: jest.fn().mockResolvedValue('test-uid'),
}));

describe('saveCardImagesAndMeta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ensureAnonymousAuth as jest.Mock).mockResolvedValue('test-uid');
    (setDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it('saves the card with a single setDoc call to cards/{uid} and does not read or delete other documents', async () => {
    await saveCardImagesAndMeta({
      frontBase64: 'ZnJvbnQ=',
      backBase64: 'YmFjaw==',
      meta: {
        cardId: 'test-uid',
        templateId: 'template_01',
        orientation: 'vertical',
        cardName: 'My Card',
        shortUrl: 'https://sokumeshi-58f06.web.app/c/test-uid',
        qrCodeData: 'https://sokumeshi-58f06.web.app/c/test-uid',
        personalInfo: { nameJa: '山田太郎', nameEn: 'Taro Yamada' },
        socialLinks: {},
        techStack: { languages: [], frameworks: [] },
      },
    });

    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledWith({}, 'cards', 'test-uid');

    const savedData = (setDoc as jest.Mock).mock.calls[0][1];
    expect(savedData.frontImageUrl).toBe('data:image/jpeg;base64,ZnJvbnQ=');
    expect(savedData.backImageUrl).toBe('data:image/jpeg;base64,YmFjaw==');

    expect(getDocs).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('passes portfolioLinks through to the data sent with setDoc', async () => {
    await saveCardImagesAndMeta({
      frontBase64: 'ZnJvbnQ=',
      backBase64: 'YmFjaw==',
      meta: {
        cardId: 'test-uid',
        templateId: 'template_01',
        orientation: 'vertical',
        cardName: 'My Card',
        shortUrl: 'https://sokumeshi-58f06.web.app/c/test-uid',
        qrCodeData: 'https://sokumeshi-58f06.web.app/c/test-uid',
        personalInfo: { nameJa: '山田太郎', nameEn: 'Taro Yamada' },
        socialLinks: {},
        techStack: { languages: [], frameworks: [] },
        portfolioLinks: ['https://portfolio.example.com'],
      },
    });

    const savedData = (setDoc as jest.Mock).mock.calls[0][1];
    expect(savedData.portfolioLinks).toEqual(['https://portfolio.example.com']);
  });

  it('does not call setDoc or sign in when the combined base64 length exceeds MAX_TOTAL_BASE64', async () => {
    const frontLength = Math.floor(MAX_TOTAL_BASE64 / 2);
    const backLength = MAX_TOTAL_BASE64 - frontLength + 1;

    await expect(
      saveCardImagesAndMeta({
        frontBase64: 'a'.repeat(frontLength),
        backBase64: 'a'.repeat(backLength),
        meta: {
          cardId: 'test-uid',
          templateId: 'template_01',
          orientation: 'vertical',
          cardName: 'My Card',
          shortUrl: 'https://sokumeshi-58f06.web.app/c/test-uid',
          qrCodeData: 'https://sokumeshi-58f06.web.app/c/test-uid',
          personalInfo: { nameJa: '山田太郎', nameEn: 'Taro Yamada' },
          socialLinks: {},
          techStack: { languages: [], frameworks: [] },
        },
      })
    ).rejects.toThrow(ImageTooLargeError);

    expect(setDoc).not.toHaveBeenCalled();
    expect(ensureAnonymousAuth).not.toHaveBeenCalled();
  });
});
