import {
  buildImageDataUrls,
  MAX_TOTAL_BASE64,
  IMAGE_TOO_LARGE_MESSAGE,
  ImageTooLargeError,
} from '@/src/services/cardImage';

describe('buildImageDataUrls', () => {
  it('builds image/jpeg data URLs from plain base64', () => {
    const result = buildImageDataUrls('ZnJvbnQ=', 'YmFjaw==');

    expect(result.frontImageUrl).toBe('data:image/jpeg;base64,ZnJvbnQ=');
    expect(result.backImageUrl).toBe('data:image/jpeg;base64,YmFjaw==');
  });

  it('strips an existing data URL prefix before rebuilding as image/jpeg', () => {
    const result = buildImageDataUrls(
      'data:image/png;base64,ZnJvbnQ=',
      'data:image/jpeg;base64,YmFjaw=='
    );

    expect(result.frontImageUrl).toBe('data:image/jpeg;base64,ZnJvbnQ=');
    expect(result.backImageUrl).toBe('data:image/jpeg;base64,YmFjaw==');
  });

  it('allows a total length exactly at MAX_TOTAL_BASE64', () => {
    const frontLength = Math.floor(MAX_TOTAL_BASE64 / 2);
    const backLength = MAX_TOTAL_BASE64 - frontLength;
    const front = 'a'.repeat(frontLength);
    const back = 'a'.repeat(backLength);

    const result = buildImageDataUrls(front, back);

    expect(result.frontImageUrl).toBe(`data:image/jpeg;base64,${front}`);
    expect(result.backImageUrl).toBe(`data:image/jpeg;base64,${back}`);
  });

  it('throws with the required message when the total length exceeds MAX_TOTAL_BASE64 by one char', () => {
    const frontLength = Math.floor(MAX_TOTAL_BASE64 / 2);
    const backLength = MAX_TOTAL_BASE64 - frontLength + 1;
    const front = 'a'.repeat(frontLength);
    const back = 'a'.repeat(backLength);

    expect(() => buildImageDataUrls(front, back)).toThrow(IMAGE_TOO_LARGE_MESSAGE);
  });

  it('throws an ImageTooLargeError instance (not a plain Error) when the size limit is exceeded', () => {
    const frontLength = Math.floor(MAX_TOTAL_BASE64 / 2);
    const backLength = MAX_TOTAL_BASE64 - frontLength + 1;
    const front = 'a'.repeat(frontLength);
    const back = 'a'.repeat(backLength);

    expect(() => buildImageDataUrls(front, back)).toThrow(ImageTooLargeError);
  });
});
