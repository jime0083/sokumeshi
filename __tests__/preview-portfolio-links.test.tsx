/// <reference types="expo-router/types/expect" />
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useCardStore } from '@/src/store/cardStore';
import { saveCardImagesAndMeta } from '@/src/services/storage';
import i18n, { initializeI18n } from '@/src/i18n';

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => <View ref={ref}>{props.children}</View>),
    captureRef: jest.fn().mockResolvedValue('ZmFrZS1iYXNlNjQ='),
  };
});

jest.mock('@/src/services/firebase', () => ({
  ensureAnonymousAuth: jest.fn().mockResolvedValue('test-uid'),
}));
jest.mock('@/src/services/storage', () => ({
  saveCardImagesAndMeta: jest.fn().mockResolvedValue({ shortUrl: 'https://sokumeshi-58f06.web.app/c/test-uid' }),
}));
jest.mock('@/src/services/saved', () => ({
  getSavedCardMeta: jest.fn().mockResolvedValue(null),
  setSavedCardMeta: jest.fn().mockResolvedValue(undefined),
  clearSavedCardMeta: jest.fn().mockResolvedValue(undefined),
}));

function goToBack() {
  renderRouter('./app', { initialUrl: '/templates' });

  fireEvent.press(screen.getByText('テンプレート1'));
  fireEvent.changeText(screen.getByPlaceholderText('氏名（日本語）'), '山田太郎');
  fireEvent.changeText(screen.getByPlaceholderText('氏名（英語）'), 'Taro Yamada');
  fireEvent.press(screen.getByText('裏面へ進む'));

  expect(screen).toHavePathname('/back');
}

describe('preview screen save meta: portfolioLinks', () => {
  beforeEach(() => {
    useCardStore.getState().reset();
    initializeI18n();
    i18n.changeLanguage('ja');
    (saveCardImagesAndMeta as jest.Mock).mockClear();
  });

  it('includes only the non-empty portfolio URL entered on the back screen', async () => {
    goToBack();

    const urlInputs = screen.getAllByPlaceholderText('URL');
    fireEvent.changeText(urlInputs[0], 'https://portfolio.example.com');

    fireEvent.press(screen.getByText('名刺作成'));
    expect(screen).toHavePathname('/preview');

    await act(async () => {
      fireEvent.press(screen.getByText('保存'));
    });

    await waitFor(() => expect(saveCardImagesAndMeta).toHaveBeenCalledTimes(1));

    const { meta } = (saveCardImagesAndMeta as jest.Mock).mock.calls[0][0];
    expect(meta.portfolioLinks).toEqual(['https://portfolio.example.com']);
  });

  it('sends an empty array when both portfolio URL fields are empty', async () => {
    goToBack();

    fireEvent.press(screen.getByText('名刺作成'));
    expect(screen).toHavePathname('/preview');

    await act(async () => {
      fireEvent.press(screen.getByText('保存'));
    });

    await waitFor(() => expect(saveCardImagesAndMeta).toHaveBeenCalledTimes(1));

    const { meta } = (saveCardImagesAndMeta as jest.Mock).mock.calls[0][0];
    expect(meta.portfolioLinks).toEqual([]);
  });
});
