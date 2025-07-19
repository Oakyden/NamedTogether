import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  coupleId?: string;
  invitePending?: boolean;
}

export interface Couple {
  id: string;
  userIds: [string, string];
  createdAt: Timestamp;
}

export interface BabyName {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  origin?: string;
}

export interface Vote {
  id: string;
  userId: string;
  nameId: string;
  vote: 'yes' | 'no';
  timestamp: Timestamp;
}

export interface Shortlist {
  id: string;
  coupleId: string;
  matchedNames: {
    nameId: string;
    addedAt: Timestamp;
  }[];
}

export interface Invite {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  coupleId?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}