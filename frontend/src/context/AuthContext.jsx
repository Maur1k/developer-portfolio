import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, githubProvider, googleProvider, adminEmail, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

function isAuthorizedEmail(email) {
  return Boolean(email && email.toLowerCase() === adminEmail.toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && !isAuthorizedEmail(nextUser.email)) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(nextUser);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => {
    const isAdmin = isAuthorizedEmail(user?.email);

    return {
      user,
      loading,
      isAdmin,
      adminEmail,
      isFirebaseConfigured,
      login: async (provider = 'google') => {
        if (!auth) {
          throw new Error('Firebase is not configured. Add your Vite Firebase environment variables first.');
        }

        const selectedProvider = provider === 'github' ? githubProvider : googleProvider;
        const credential = await signInWithPopup(auth, selectedProvider);

        if (!isAuthorizedEmail(credential.user.email)) {
          await signOut(auth);
          throw new Error('This account is not authorized for the dashboard.');
        }
      },
      logout: () => (auth ? signOut(auth) : Promise.resolve()),
    };
  }, [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
