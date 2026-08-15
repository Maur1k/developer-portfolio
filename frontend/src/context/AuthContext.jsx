import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, adminEmail, isSupabaseConfigured } from '../supabase/client';

const AuthContext = createContext(null);

function isAuthorizedEmail(email) {
  return Boolean(email && email.toLowerCase() === adminEmail.toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    // Check current active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (isAuthorizedEmail(session.user.email)) {
          setUser(session.user);
        } else {
          supabase.auth.signOut();
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (isAuthorizedEmail(session.user.email)) {
          setUser(session.user);
        } else {
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const isAdmin = isAuthorizedEmail(user?.email);

    return {
      user,
      loading,
      isAdmin,
      adminEmail,
      isSupabaseConfigured,
      isFirebaseConfigured: isSupabaseConfigured, // Backward compatibility alias
      login: async (emailOrProvider, password) => {
        if (!supabase) {
          throw new Error('Supabase is not configured. Add your Vite Supabase environment variables first.');
        }

        // If password is provided, perform email/password sign-in
        if (password !== undefined) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailOrProvider,
            password,
          });

          if (error) throw error;

          if (!isAuthorizedEmail(data.user?.email)) {
            await supabase.auth.signOut();
            throw new Error('This account is not authorized for the admin dashboard.');
          }
          return data;
        }

        // Otherwise OAuth provider (google or github)
        const provider = emailOrProvider === 'github' ? 'github' : 'google';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) throw error;
        return data;
      },
      logout: () => (supabase ? supabase.auth.signOut() : Promise.resolve()),
    };
  }, [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
