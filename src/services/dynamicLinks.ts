import Constants from 'expo-constants';

type CreateShortLinkParams = {
  link: string; // deep link into the app (e.g., myapp://card/{cardId})
};

export async function createShortLink({ link }: CreateShortLinkParams): Promise<string> {
  const apiKey = (Constants.expoConfig?.extra as any)?.firebase?.apiKey as string;
  const domainUriPrefix = (Constants.expoConfig?.extra as any)?.dynamicLinks?.domain as string;

  const body = {
    dynamicLinkInfo: {
      domainUriPrefix,
      link,
      androidInfo: {},
      iosInfo: {},
    },
    suffix: { option: 'SHORT' },
  };

  const res = await fetch(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create short link');
  const json = await res.json();
  return json.shortLink as string;
}


