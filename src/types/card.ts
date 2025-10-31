export type Orientation = 'vertical' | 'horizontal';

export type SocialLinks = {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  github?: string;
  email?: string;
};

export type ContactService = 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'github' | 'email';

export type ContactEntry = {
  service: ContactService | '';
  url: string;
};

export type TechStack = {
  languages: string[];
  frameworks: string[];
};

export type PersonalInfo = {
  profileImage?: string; // base64 or uri
  nameJa: string;
  nameEn: string;
  jobTitle?: string;
};

export type CardMeta = {
  userId: string;
  cardId: string;
  cardName?: string;
  templateId: string;
  orientation: Orientation;
  frontImageUrl?: string;
  backImageUrl?: string;
  shortUrl?: string;
  qrCodeData?: string;
  personalInfo: PersonalInfo;
  socialLinks: SocialLinks;
  techStack: TechStack;
  careerPortfolio?: string;
  createdAt?: number;
  updatedAt?: number;
};


