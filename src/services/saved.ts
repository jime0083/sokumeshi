import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardMeta } from '@/src/types/card';

const KEY = 'saved-card-meta';

export async function getSavedCardMeta(): Promise<CardMeta | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (!v) return null;
    return JSON.parse(v) as CardMeta;
  } catch {
    return null;
  }
}

export async function setSavedCardMeta(meta: CardMeta): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(meta));
}

export async function clearSavedCardMeta(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}


