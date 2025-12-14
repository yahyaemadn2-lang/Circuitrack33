import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  role: 'buyer' | 'vendor' | 'admin';
  phone?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isBuyer: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, role: 'buyer' | 'vendor') => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        setProfile(null);
        return;
      }

      if (existingProfile) {
        setProfile(existingProfile);
        return;
      }

      const authUser = (await supabase.auth.getUser()).data.user;
      const roleFromMetadata = authUser?.user_metadata?.role || 'buyer';

      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser?.email || '',
          role: roleFromMetadata,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        setProfile(null);
      } else {
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error);
      setProfile(null);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: 'buyer' | 'vendor') => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Registration failed' };
      }

      const userId = authData.user.id;

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: role,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { error: 'Failed to create user profile' };
      }

      if (role === 'vendor') {
        const displayName = email.split('@')[0];
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: userId,
            display_name: displayName,
            status: 'pending',
          });

        if (vendorError) {
          console.error('Error creating vendor profile:', vendorError);
        }
      }

      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
        });

      if (walletError) {
        console.error('Error creating wallet:', walletError);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const isBuyer = profile?.role === 'buyer';
  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    session,
    loading,
    isBuyer,
    isVendor,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
