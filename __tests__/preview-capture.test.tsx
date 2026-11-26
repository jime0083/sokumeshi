/// <reference types="expo-router/types/expect" />
import { Alert } from 'react-native';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useCardStore } from '@/src/store/cardStore';
import { saveCardImagesAndMeta } from '@/src/services/storage';
import { ImageTooLargeError, IMAGE_TOO_LARGE_MESSAGE } from '@/src/services/cardImage';
import i18n, { initializeI18n } from '@/src/i18n';

const mockCaptureRef = jest.fn().mockResolvedValue('ZmFrZS1iYXNlNjQ=');

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => <View ref={ref}>{props.children}</View>),
    captureRef: (...args: unknown[]) => mockCaptureRef(...args),
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
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

function goToPreview() {
  renderRouter('./app', { initialUrl: '/templates' });

  fireEvent.press(screen.getByText('テンプレート1'));
  fireEvent.changeText(screen.getByPlaceholderText('氏名（日本語）'), '山田太郎');
  fireEvent.changeText(screen.getByPlaceholderText('氏名（英語）'), 'Taro Yamada');
  fireEvent.press(screen.getByText('裏面へ進む'));
  fireEvent.press(screen.getByText('名刺作成'));

  expect(screen).toHavePathname('/preview');
}

describe('preview screen capture options', () => {
  beforeEach(() => {
    useCardStore.getState().reset();
    initializeI18n();
    i18n.changeLanguage('ja');
    mockCaptureRef.mockClear();
    (saveCardImagesAndMeta as jest.Mock).mockClear();
  });

  it('captures front/back as JPEG quality 0.8 when saving to Firebase', async () => {
    goToPreview();

    await act(async () => {
      fireEvent.press(screen.getByText('保存'));
    });

    await waitFor(() => expect(mockCaptureRef).toHaveBeenCalledTimes(2));

    expect(mockCaptureRef).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      { format: 'jpg', quality: 0.8, result: 'base64' }
    );
    expect(mockCaptureRef).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { format: 'jpg', quality: 0.8, result: 'base64' }
    );
  });

  it('captures front/back as PNG quality 1 when saving to the camera roll', async () => {
    goToPreview();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await act(async () => {
      fireEvent.press(screen.getByText('画像にしてスマホに保存'));
    });

    await waitFor(() => expect(mockCaptureRef).toHaveBeenCalledTimes(2));

    expect(mockCaptureRef).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      { format: 'png', quality: 1, result: 'base64' }
    );
    expect(mockCaptureRef).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { format: 'png', quality: 1, result: 'base64' }
    );

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('保存しました', '名刺画像をカメラロールに保存しました。'));
    alertSpy.mockRestore();
  });

  it('shows only the size-guard message when saveCardImagesAndMeta throws ImageTooLargeError', async () => {
    goToPreview();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (saveCardImagesAndMeta as jest.Mock).mockRejectedValueOnce(new ImageTooLargeError());

    await act(async () => {
      fireEvent.press(screen.getByText('保存'));
    });

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('エラー', IMAGE_TOO_LARGE_MESSAGE));
    alertSpy.mockRestore();
  });

  it('shows the Firebase error format for other save failures', async () => {
    goToPreview();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const permissionError = Object.assign(new Error('Missing or insufficient permissions.'), {
      code: 'permission-denied',
    });
    (saveCardImagesAndMeta as jest.Mock).mockRejectedValueOnce(permissionError);

    await act(async () => {
      fireEvent.press(screen.getByText('保存'));
    });

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'エラー',
        'Firebase: Error (permission-denied).\nMissing or insufficient permissions.'
      )
    );
    alertSpy.mockRestore();
  });
});
