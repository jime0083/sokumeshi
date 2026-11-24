/// <reference types="expo-router/types/expect" />
import { Alert } from 'react-native';
import { fireEvent, renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';

import { useCardStore } from '@/src/store/cardStore';
import i18n, { initializeI18n } from '@/src/i18n';

jest.mock('@/src/services/firebase', () => ({
  ensureAnonymousAuth: jest.fn().mockResolvedValue('test-uid'),
}));
jest.mock('@/src/services/storage', () => ({
  saveCardImagesAndMeta: jest.fn().mockResolvedValue({}),
}));
jest.mock('@/src/services/saved', () => ({
  getSavedCardMeta: jest.fn().mockResolvedValue(null),
  setSavedCardMeta: jest.fn().mockResolvedValue(undefined),
  clearSavedCardMeta: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));

describe('navigation', () => {
  beforeEach(async () => {
    useCardStore.getState().reset();
    initializeI18n();
    await i18n.changeLanguage('ja');
  });

  it('goes from templates to front when a template is pressed', () => {
    renderRouter('./app', { initialUrl: '/templates' });

    fireEvent.press(screen.getByText('テンプレート1'));

    expect(screen).toHavePathname('/front');
  });

  it('shows an alert and stays on front when the name is empty', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderRouter('./app', { initialUrl: '/templates' });

    fireEvent.press(screen.getByText('テンプレート1'));
    fireEvent.press(screen.getByText('裏面へ進む'));

    expect(alertSpy).toHaveBeenCalledWith('名前が入力されていません');
    expect(screen).toHavePathname('/front');

    alertSpy.mockRestore();
  });

  it('goes from front to back and to preview when the forms are filled in', () => {
    renderRouter('./app', { initialUrl: '/templates' });

    fireEvent.press(screen.getByText('テンプレート1'));
    fireEvent.changeText(screen.getByPlaceholderText('氏名（日本語）'), '山田太郎');
    fireEvent.changeText(screen.getByPlaceholderText('氏名（英語）'), 'Taro Yamada');
    fireEvent.press(screen.getByText('裏面へ進む'));

    expect(screen).toHavePathname('/back');

    fireEvent.press(screen.getByText('名刺作成'));

    expect(screen).toHavePathname('/preview');
  });

  it('keeps the entered values when going back from back to front', () => {
    renderRouter('./app', { initialUrl: '/templates' });

    fireEvent.press(screen.getByText('テンプレート1'));
    fireEvent.changeText(screen.getByPlaceholderText('氏名（日本語）'), '山田太郎');
    fireEvent.changeText(screen.getByPlaceholderText('氏名（英語）'), 'Taro Yamada');
    fireEvent.press(screen.getByText('裏面へ進む'));

    expect(screen).toHavePathname('/back');

    testRouter.back();

    expect(screen).toHavePathname('/front');
    expect(screen.getByPlaceholderText('氏名（日本語）').props.value).toBe('山田太郎');
    expect(screen.getByPlaceholderText('氏名（英語）').props.value).toBe('Taro Yamada');
  });

  it('keeps the entered back-form values when going back from preview to back', () => {
    renderRouter('./app', { initialUrl: '/templates' });

    fireEvent.press(screen.getByText('テンプレート1'));
    fireEvent.changeText(screen.getByPlaceholderText('氏名（日本語）'), '山田太郎');
    fireEvent.changeText(screen.getByPlaceholderText('氏名（英語）'), 'Taro Yamada');
    fireEvent.press(screen.getByText('裏面へ進む'));

    expect(screen).toHavePathname('/back');

    fireEvent.changeText(screen.getByPlaceholderText('JavaScript, TypeScript, Python'), 'TypeScript, Go');
    fireEvent.changeText(screen.getByPlaceholderText('React, React Native, Django'), 'Next.js');
    fireEvent.press(screen.getByText('名刺作成'));

    expect(screen).toHavePathname('/preview');

    testRouter.back();

    expect(screen).toHavePathname('/back');
    expect(screen.getByPlaceholderText('JavaScript, TypeScript, Python').props.value).toBe('TypeScript, Go');
    expect(screen.getByPlaceholderText('React, React Native, Django').props.value).toBe('Next.js');
  });
});
