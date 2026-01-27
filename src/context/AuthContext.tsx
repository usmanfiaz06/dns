import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { User, InvitedUser, CompanySettings } from '../types/auth';
import { defaultCompanySettings } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  companySettings: CompanySettings | null;
  invitedUsers: InvitedUser[];
  teamMembers: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  inviteUser: (email: string) => { success: boolean; error?: string };
  removeInvite: (id: string) => void;
  removeMember: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('qns-users') || '[]');
  } catch { return []; }
}

function saveUsers(users: User[]) {
  localStorage.setItem('qns-users', JSON.stringify(users));
}

function getInvites(): InvitedUser[] {
  try {
    return JSON.parse(localStorage.getItem('qns-invites') || '[]');
  } catch { return []; }
}

function saveInvites(invites: InvitedUser[]) {
  localStorage.setItem('qns-invites', JSON.stringify(invites));
}

function getCompanySettings(companyId: string): CompanySettings | null {
  try {
    const all = JSON.parse(localStorage.getItem('qns-company-settings') || '{}');
    return all[companyId] || null;
  } catch { return null; }
}

function saveCompanySettings(settings: CompanySettings) {
  try {
    const all = JSON.parse(localStorage.getItem('qns-company-settings') || '{}');
    all[settings.id] = settings;
    localStorage.setItem('qns-company-settings', JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('qns-current-user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(() => {
    if (!currentUser) return null;
    return getCompanySettings(currentUser.companyId);
  });

  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>(() => {
    if (!currentUser) return [];
    return getInvites().filter(i => i.companyId === currentUser.companyId);
  });

  const [teamMembers, setTeamMembers] = useState<User[]>(() => {
    if (!currentUser) return [];
    return getUsers().filter(u => u.companyId === currentUser.companyId && u.id !== currentUser.id);
  });

  const refreshTeam = useCallback((user: User) => {
    setInvitedUsers(getInvites().filter(i => i.companyId === user.companyId));
    setTeamMembers(getUsers().filter(u => u.companyId === user.companyId && u.id !== user.id));
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'No account found with this email' };
    if (user.password !== password) return { success: false, error: 'Incorrect password' };

    localStorage.setItem('qns-current-user', JSON.stringify(user));
    setCurrentUser(user);
    setCompanySettings(getCompanySettings(user.companyId));
    refreshTeam(user);

    // Mark invite as accepted
    const invites = getInvites();
    const invite = invites.find(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');
    if (invite) {
      invite.status = 'accepted';
      saveInvites(invites);
    }

    return { success: true };
  }, [refreshTeam]);

  const signup = useCallback((name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Check if invited
    const invites = getInvites();
    const invite = invites.find(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');

    const companyId = invite ? invite.companyId : uuidv4();
    const user: User = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password,
      role: invite ? 'member' : 'owner',
      companyId,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    saveUsers(users);

    // If invited, mark as accepted
    if (invite) {
      invite.status = 'accepted';
      saveInvites(invites);
    }

    // If owner, create company settings
    if (!invite) {
      const settings: CompanySettings = {
        ...defaultCompanySettings,
        id: companyId,
        ownerId: user.id,
      };
      saveCompanySettings(settings);
      setCompanySettings(settings);
    } else {
      setCompanySettings(getCompanySettings(companyId));
    }

    localStorage.setItem('qns-current-user', JSON.stringify(user));
    setCurrentUser(user);
    refreshTeam(user);

    return { success: true };
  }, [refreshTeam]);

  const logout = useCallback(() => {
    localStorage.removeItem('qns-current-user');
    setCurrentUser(null);
    setCompanySettings(null);
    setInvitedUsers([]);
    setTeamMembers([]);
  }, []);

  const updateCompanySettings = useCallback((partial: Partial<CompanySettings>) => {
    if (!currentUser || !companySettings) return;
    const updated = { ...companySettings, ...partial };
    saveCompanySettings(updated);
    setCompanySettings(updated);
  }, [currentUser, companySettings]);

  const inviteUser = useCallback((email: string) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const existing = getInvites().find(
      i => i.email.toLowerCase() === email.toLowerCase() && i.companyId === currentUser.companyId
    );
    if (existing) return { success: false, error: 'This email has already been invited' };

    const existingUser = getUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.companyId === currentUser.companyId
    );
    if (existingUser) return { success: false, error: 'This user is already a member' };

    const invite: InvitedUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      invitedBy: currentUser.id,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      companyId: currentUser.companyId,
    };

    const invites = getInvites();
    invites.push(invite);
    saveInvites(invites);
    setInvitedUsers(invites.filter(i => i.companyId === currentUser.companyId));

    return { success: true };
  }, [currentUser]);

  const removeInvite = useCallback((id: string) => {
    if (!currentUser) return;
    const invites = getInvites().filter(i => i.id !== id);
    saveInvites(invites);
    setInvitedUsers(invites.filter(i => i.companyId === currentUser.companyId));
  }, [currentUser]);

  const removeMember = useCallback((id: string) => {
    if (!currentUser) return;
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
    setTeamMembers(users.filter(u => u.companyId === currentUser.companyId && u.id !== currentUser.id));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
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
