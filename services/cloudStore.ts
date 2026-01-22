
import { GirlfriendProfile, PaymentRequest, UserProfile } from "../types";
import { PROFILES as INITIAL_PROFILES } from "../constants";

// KEYS
const K_PROFILES = 'priyo_cloud_profiles';
const K_USERS = 'priyo_cloud_users';
const K_REQUESTS = 'priyo_cloud_requests';
const K_SESSION = 'priyo_cloud_session';

// --- DATA INITIALIZATION ---
const getStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch { return defaultVal; }
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const cloudStore = {
  // --- PROFILES ---
  async getProfiles(): Promise<GirlfriendProfile[]> {
    return getStorage<GirlfriendProfile[]>(K_PROFILES, INITIAL_PROFILES);
  },

  async saveProfiles(profiles: GirlfriendProfile[]) {
    setStorage(K_PROFILES, profiles);
    return true;
  },

  // --- USERS (AUTH & DATA) ---
  async createUser(user: UserProfile): Promise<UserProfile> {
    const users = getStorage<UserProfile[]>(K_USERS, []);
    if (users.find(u => u.id === user.id)) return user;
    
    users.push(user);
    setStorage(K_USERS, users);
    return user;
  },

  async getUser(id: string): Promise<UserProfile | undefined> {
    const users = getStorage<UserProfile[]>(K_USERS, []);
    return users.find(u => u.id === id);
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const users = getStorage<UserProfile[]>(K_USERS, []);
    const idx = users.findIndex(u => u.id === id);
    
    if (idx === -1) return null;
    
    const updatedUser = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    setStorage(K_USERS, users);
    return updatedUser;
  },

  async login(email: string): Promise<UserProfile | null> {
    // Simple simulation: find user by ID which we use as email for simplicity in this no-backend version
    // In real usage, we search the array
    // Since we don't have email in UserProfile explicitly in this simplified type, we simulate auth
    // For this build, we just assume the user ID matches the one generated/stored.
    const users = getStorage<UserProfile[]>(K_USERS, []);
    // Mock: just return the first user if exists or null
    // In a real local simulation, we'd need to store credentials. 
    // We will handle Auth logic in AuthScreen, here we just provide storage access.
    return null; 
  },

  // --- PAYMENTS ---
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    return getStorage<PaymentRequest[]>(K_REQUESTS, []);
  },

  async savePaymentRequests(requests: PaymentRequest[]) {
    setStorage(K_REQUESTS, requests);
  },

  // --- SESSION ---
  setSession(userId: string) {
    localStorage.setItem(K_SESSION, userId);
  },

  getSession(): string | null {
    return localStorage.getItem(K_SESSION);
  },

  clearSession() {
    localStorage.removeItem(K_SESSION);
  }
};
