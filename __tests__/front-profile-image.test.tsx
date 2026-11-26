/// <reference types="expo-router/types/expect" />
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useCardStore } from '@/src/store/cardStore';
import i18n, { initializeI18n } from '@/src/i18n';

const DOCUMENT_DIRECTORY = 'file:///var/mobile/Containers/Data/Application/ABC/Documents/';
const PICKED_URI = 'file:///tmp/ImagePicker/picked-123.jpg';

const mockGetInfoAsync = jest.fn().mockResolvedValue({ exists: true });
const mockMakeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
const mockCopyAsync = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///var/mobile/Containers/Data/Application/ABC/Documents/',
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  makeDirectoryAsync: (...args: unknown[]) => mockMakeDirectoryAsync(...args),
  copyAsync: (...args: unknown[]) => mockCopyAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///tmp/ImagePicker/picked-123.jpg' }],
  }),
}));

describe('front profile image picking', () => {
  beforeEach(() => {
    useCardStore.getState().reset();
    initializeI18n();
    i18n.changeLanguage('ja');
    mockGetInfoAsync.mockClear();
    mockMakeDirectoryAsync.mockClear();
    mockCopyAsync.mockClear();
    mockDeleteAsync.mockClear();
  });

  it('copies the picked image into documentDirectory/profile/ and stores a relative path', async () => {
    renderRouter('./app', { initialUrl: '/front' });

    fireEvent.press(screen.getByText('カメラロールから選択'));

    await waitFor(() => expect(mockCopyAsync).toHaveBeenCalledTimes(1));

    const call = mockCopyAsync.mock.calls[0][0];
    expect(call.from).toBe(PICKED_URI);
    expect(call.to.startsWith(`${DOCUMENT_DIRECTORY}profile/`)).toBe(true);

    await waitFor(() => {
      const stored = useCardStore.getState().draft.personalInfo.profileImage;
      expect(stored).toBeDefined();
      expect(stored!.startsWith('profile/')).toBe(true);
      expect(stored!.startsWith('file://')).toBe(false);
    });
  });

  it('deletes the previous profile image file after picking a new one', async () => {
    useCardStore.getState().setPersonalInfo({ profileImage: 'profile/old-photo.jpg' });
    renderRouter('./app', { initialUrl: '/front' });

    fireEvent.press(screen.getByText('カメラロールから選択'));

    await waitFor(() => expect(mockDeleteAsync).toHaveBeenCalledTimes(1));
    expect(mockDeleteAsync).toHaveBeenCalledWith(
      `${DOCUMENT_DIRECTORY}profile/old-photo.jpg`,
      { idempotent: true }
    );
  });
});
