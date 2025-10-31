export const SOCIAL_ICON = {
  twitter: require('@/assets/images/icons/social/X.png'),
  instagram: require('@/assets/images/icons/social/insta.png'),
  tiktok: require('@/assets/images/icons/social/tiktok.png'),
  youtube: require('@/assets/images/icons/social/youtube.png'),
  github: require('@/assets/images/icons/social/github.png'),
  email: require('@/assets/images/icons/social/mail.png'),
} as const;

export type SocialKey = keyof typeof SOCIAL_ICON;


