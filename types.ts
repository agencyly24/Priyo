
export enum PersonalityType {
  Sweet = 'Sweet & Caring',
  Romantic = 'Romantic & Flirty',
  Playful = 'Playful & Funny',
  Listener = 'Emotional Listener',
  Intellectual = 'Intellectual',
  Girlfriend = 'Girlfriend Mode',
  Wife = 'Caring Wife',
  Flirty = 'Flirty Girl',
  Sexy = 'Sexy Girl',
  Horny = 'Horny Mode',
  Friend = 'Just Friend'
}

export type SubscriptionTier = 'Free' | 'Gold' | 'Diamond';

export interface ProfileGalleryItem {
  type: 'image' | 'video';
  url: string;
}

export interface GirlfriendProfile {
  id: string;
  name: string;
  age: number;
  personality: PersonalityType;
  image: string;
  voiceName: string;
  intro: string;
  systemPrompt: string;
  appearance: {
    ethnicity: string;
    eyeColor: string;
    bodyType: string;
    breastSize: string;
    hairStyle: string;
    hairColor: string;
    outfit: string;
  };
  character: {
    relationship: string;
    occupation: string;
    kinks: string[];
  };
  gallery: ProfileGalleryItem[];
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  tier: SubscriptionTier;
  amount: number;
  bkashNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  joinedDate: string;
  tier: SubscriptionTier;
  isPremium: boolean;
  isAdmin: boolean;
  stats: {
    messagesSent: number;
    hoursChatted: number;
    companionsMet: number;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export type View = 'landing' | 'auth' | 'age-verification' | 'profile-selection' | 'profile-detail' | 'chat' | 'account' | 'subscription' | 'admin-panel';
