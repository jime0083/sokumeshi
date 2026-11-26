import * as FileSystem from 'expo-file-system/legacy';
import {
  resolveProfileImageUri,
  copyImageToProfileDirectory,
  migrateLegacyProfileImage,
} from '@/src/services/profileImage';

jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

const DOCUMENT_DIRECTORY = 'file:///var/mobile/Containers/Data/Application/ABC/Documents/';

describe('resolveProfileImageUri', () => {
  it('prefixes a relative path with documentDirectory', () => {
    expect(resolveProfileImageUri('profile/abc.jpg', DOCUMENT_DIRECTORY)).toBe(
      `${DOCUMENT_DIRECTORY}profile/abc.jpg`
    );
  });

  it('returns a legacy absolute file:// path unchanged', () => {
    const legacy = 'file:///var/mobile/Containers/Data/Application/OLD/tmp/ImagePicker/abc.jpg';
    expect(resolveProfileImageUri(legacy, DOCUMENT_DIRECTORY)).toBe(legacy);
  });

  it('returns a legacy absolute path starting with / unchanged', () => {
    const legacy = '/var/mobile/Containers/Data/Application/OLD/tmp/ImagePicker/abc.jpg';
    expect(resolveProfileImageUri(legacy, DOCUMENT_DIRECTORY)).toBe(legacy);
  });

  it('returns undefined when the value is empty', () => {
    expect(resolveProfileImageUri('', DOCUMENT_DIRECTORY)).toBeUndefined();
    expect(resolveProfileImageUri(undefined, DOCUMENT_DIRECTORY)).toBeUndefined();
    expect(resolveProfileImageUri(null, DOCUMENT_DIRECTORY)).toBeUndefined();
  });

  it('returns undefined for a relative path when documentDirectory is unavailable', () => {
    expect(resolveProfileImageUri('profile/abc.jpg', null)).toBeUndefined();
  });
});

describe('copyImageToProfileDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
  });

  it('copies the source uri into documentDirectory/profile/ and returns the relative path', async () => {
    const relativePath = await copyImageToProfileDirectory({
      sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(relativePath.startsWith('profile/')).toBe(true);
    expect(relativePath.endsWith('.jpg')).toBe(true);

    expect(FileSystem.copyAsync).toHaveBeenCalledTimes(1);
    const call = (FileSystem.copyAsync as jest.Mock).mock.calls[0][0];
    expect(call.from).toBe('file:///tmp/ImagePicker/picked.jpg');
    expect(call.to).toBe(`${DOCUMENT_DIRECTORY}${relativePath}`);
  });

  it('creates the profile directory when it does not exist yet', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    await copyImageToProfileDirectory({
      sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      `${DOCUMENT_DIRECTORY}profile`,
      { intermediates: true }
    );
  });

  it('does not create the profile directory when it already exists', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

    await copyImageToProfileDirectory({
      sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
  });

  it('deletes the previous relative profile image after copying the new one', async () => {
    await copyImageToProfileDirectory({
      sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
      previousValue: 'profile/old.jpg',
    });

    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      `${DOCUMENT_DIRECTORY}profile/old.jpg`,
      { idempotent: true }
    );
  });

  it('does not delete a legacy absolute previousValue', async () => {
    await copyImageToProfileDirectory({
      sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
      previousValue: 'file:///tmp/ImagePicker/old.jpg',
    });

    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });

  it('does not throw when deleting the previous file fails', async () => {
    (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(new Error('not found'));

    await expect(
      copyImageToProfileDirectory({
        sourceUri: 'file:///tmp/ImagePicker/picked.jpg',
        documentDirectory: DOCUMENT_DIRECTORY,
        previousValue: 'profile/old.jpg',
      })
    ).resolves.toEqual(expect.stringContaining('profile/'));
  });
});

describe('migrateLegacyProfileImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copies to profile/ and returns a relative path when the legacy absolute file exists', async () => {
    const legacyUri = 'file:///var/mobile/Containers/Data/Application/OLD/tmp/ImagePicker/abc.jpg';
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

    const result = await migrateLegacyProfileImage({
      value: legacyUri,
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(legacyUri);
    expect(FileSystem.copyAsync).toHaveBeenCalledTimes(1);
    expect(result?.startsWith('profile/')).toBe(true);
  });

  it('returns the value unchanged when the legacy file does not exist', async () => {
    const legacyUri = 'file:///var/mobile/Containers/Data/Application/OLD/tmp/ImagePicker/missing.jpg';
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    const result = await migrateLegacyProfileImage({
      value: legacyUri,
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(result).toBe(legacyUri);
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  });

  it('returns the value unchanged when it is already a relative path', async () => {
    const result = await migrateLegacyProfileImage({
      value: 'profile/already-migrated.jpg',
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(result).toBe('profile/already-migrated.jpg');
    expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  });

  it('returns undefined unchanged when there is no value', async () => {
    const result = await migrateLegacyProfileImage({
      value: undefined,
      documentDirectory: DOCUMENT_DIRECTORY,
    });

    expect(result).toBeUndefined();
    expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
  });
});
