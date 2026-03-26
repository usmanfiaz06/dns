import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User, InvitedUser, CompanySettings } from '../types/auth';
import { defaultCompanySettings } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  companySettings: CompanySettings | null;
  invitedUsers: InvitedUser[];
  teamMembers: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  inviteUser: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeInvite: (id: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser(userData);

          // Get company settings
          const settingsDoc = await getDoc(doc(db, 'companies', userData.companyId));
          if (settingsDoc.exists()) {
            setCompanySettings(settingsDoc.data() as CompanySettings);
          }
        }
      } else {
        setCurrentUser(null);
        setCompanySettings(null);
        setInvitedUsers([]);
        setTeamMembers([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to team changes when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    // Listen to invites
    const invitesQuery = query(
      collection(db, 'invites'),
      where('companyId', '==', currentUser.companyId)
    );
    const unsubInvites = onSnapshot(invitesQuery, (snapshot) => {
      const invites = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as InvitedUser);
      setInvitedUsers(invites);
    });

    // Listen to team members
    const membersQuery = query(
      collection(db, 'users'),
      where('companyId', '==', currentUser.companyId)
    );
    const unsubMembers = onSnapshot(membersQuery, (snapshot) => {
      const members = snapshot.docs
        .map(d => d.data() as User)
        .filter(u => u.id !== currentUser.id);
      setTeamMembers(members);
    });

    return () => {
      unsubInvites();
      unsubMembers();
    };
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Check if user doc exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        return { success: false, error: 'User data not found. Please sign up again.' };
      }

      // Mark invite as accepted if exists
      const invitesQuery = query(
        collection(db, 'invites'),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );
      const inviteSnap = await getDocs(invitesQuery);
      for (const inviteDoc of inviteSnap.docs) {
        await setDoc(doc(db, 'invites', inviteDoc.id), { ...inviteDoc.data(), status: 'accepted' });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'No account found with this email' };
      }
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'Incorrect password' };
      }
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      // Check if invited
      const invitesQuery = query(
        collection(db, 'invites'),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );
      const inviteSnap = await getDocs(invitesQuery);
      const invite = inviteSnap.docs[0]?.data() as InvitedUser | undefined;

      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);

      const companyId = invite?.companyId || result.user.uid;
      const user: User = {
        id: result.user.uid,
        name,
        email: email.toLowerCase(),
        role: invite ? 'member' : 'owner',
        companyId,
        createdAt: new Date().toISOString(),
      };

      // Save user to Firestore
      await setDoc(doc(db, 'users', result.user.uid), user);

      // If owner, create company settings
      if (!invite) {
        const settings: CompanySettings = {
          ...defaultCompanySettings,
          id: companyId,
          ownerId: result.user.uid,
        };
        await setDoc(doc(db, 'companies', companyId), settings);
      }

      // Mark invite as accepted
      if (invite && inviteSnap.docs[0]) {
        await setDoc(doc(db, 'invites', inviteSnap.docs[0].id), {
          ...invite,
          status: 'accepted'
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters' };
      }
      return { success: false, error: error.message || 'Signup failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateCompanySettings = useCallback(async (partial: Partial<CompanySettings>) => {
    if (!currentUser || !companySettings) return;
    const updated = { ...companySettings, ...partial };
    await setDoc(doc(db, 'companies', currentUser.companyId), updated);
    setCompanySettings(updated);
  }, [currentUser, companySettings]);

  const inviteUser = useCallback(async (email: string) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    // Check if already invited
    const existingInviteQuery = query(
      collection(db, 'invites'),
      where('email', '==', email.toLowerCase()),
      where('companyId', '==', currentUser.companyId)
    );
    const existingInvite = await getDocs(existingInviteQuery);
    if (!existingInvite.empty) {
      return { success: false, error: 'This email has already been invited' };
    }

    // Check if already a member
    const existingMemberQuery = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase()),
      where('companyId', '==', currentUser.companyId)
    );
    const existingMember = await getDocs(existingMemberQuery);
    if (!existingMember.empty) {
      return { success: false, error: 'This user is already a member' };
    }

    const invite: Omit<InvitedUser, 'id'> = {
      email: email.toLowerCase(),
      invitedBy: currentUser.id,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      companyId: currentUser.companyId,
    };

    const inviteRef = doc(collection(db, 'invites'));
    await setDoc(inviteRef, { id: inviteRef.id, ...invite });

    return { success: true };
  }, [currentUser]);

  const removeInvite = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'invites', id));
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      companySettings,
      invitedUsers,
      teamMembers,
      login,
      signup,
      logout,
      updateCompanySettings,
      inviteUser,
      removeInvite,
      removeMember,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
