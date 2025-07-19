import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Couple, BabyName, Vote, Shortlist, Invite } from '../types';

export const createCouple = async (userIds: [string, string]): Promise<string> => {
  const coupleId = `couple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const coupleData: Omit<Couple, 'id'> = {
    userIds,
    createdAt: serverTimestamp() as Timestamp,
  };
  
  await setDoc(doc(db, 'couples', coupleId), coupleData);
  
  // Update both users with the coupleId
  await updateDoc(doc(db, 'users', userIds[0]), { coupleId });
  await updateDoc(doc(db, 'users', userIds[1]), { coupleId });
  
  return coupleId;
};

export const createInvite = async (inviterId: string, inviteeEmail: string): Promise<string> => {
  const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const inviteData: Omit<Invite, 'id'> = {
    inviterId,
    inviteeEmail: inviteeEmail.toLowerCase(),
    status: 'pending',
    createdAt: serverTimestamp() as Timestamp,
  };
  
  await setDoc(doc(db, 'invites', inviteId), inviteData);
  await updateDoc(doc(db, 'users', inviterId), { invitePending: true });
  
  return inviteId;
};

export const getInviteForEmail = async (email: string): Promise<Invite | null> => {
  const q = query(
    collection(db, 'invites'), 
    where('inviteeEmail', '==', email.toLowerCase()),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data() as Omit<Invite, 'id'>,
  };
};

export const acceptInvite = async (inviteId: string, inviteeUserId: string): Promise<string> => {
  const inviteDoc = await getDoc(doc(db, 'invites', inviteId));
  if (!inviteDoc.exists()) throw new Error('Invite not found');
  
  const invite = inviteDoc.data() as Invite;
  const coupleId = await createCouple([invite.inviterId, inviteeUserId]);
  
  await updateDoc(doc(db, 'invites', inviteId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
    coupleId,
  });
  
  await updateDoc(doc(db, 'users', invite.inviterId), { invitePending: false });
  
  return coupleId;
};

export const getBabyNames = async (): Promise<BabyName[]> => {
  const querySnapshot = await getDocs(collection(db, 'names'));
  
  const names = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<BabyName, 'id'>,
  }));
  
  // Sort on client side to avoid index requirement
  return names.sort((a, b) => a.name.localeCompare(b.name));
};

export const voteOnName = async (userId: string, nameId: string, vote: 'yes' | 'no'): Promise<void> => {
  const voteId = `${userId}_${nameId}`;
  
  const voteData: Omit<Vote, 'id'> = {
    userId,
    nameId,
    vote,
    timestamp: serverTimestamp() as Timestamp,
  };
  
  await setDoc(doc(db, 'votes', voteId), voteData);
};

export const getUserVotes = async (userId: string): Promise<Vote[]> => {
  const q = query(
    collection(db, 'votes'), 
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const votes = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Vote, 'id'>,
  }));
  
  // Sort on client side to avoid index requirement
  return votes.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
};

export const getShortlist = async (coupleId: string): Promise<Shortlist | null> => {
  const shortlistDoc = await getDoc(doc(db, 'shortlists', coupleId));
  if (!shortlistDoc.exists()) return null;
  
  return {
    id: shortlistDoc.id,
    ...shortlistDoc.data() as Omit<Shortlist, 'id'>,
  };
};