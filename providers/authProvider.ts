import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, DocumentSnapshot, onSnapshot } from 'firebase/firestore';
import React from 'react';

// Tipovi
interface UserDoc {
  name: string;
  email: string;
  age: number;
  createdAt?: any;
}

interface AuthState {
  user: User | null;
  userDoc: (UserDoc & { id: string }) | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  // Možeš dodati funkcije kao što su signIn, signOut, etc.
}

// Context
const AuthContext = React.createContext<AuthContextValue | null>(null);

// Hook za korišćenje context-a
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Provider komponenta
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    userDoc: null,
    loading: true,
  });

  // Praćenje auth stanja
  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setState(prevState => ({
        ...prevState,
        user,
        loading: false,
      }));
    });

    return unsubscribeAuth;
  }, []);

  // Praćenje user dokumenta
  React.useEffect(() => {
    if (!state.user) {
      setState(prevState => ({
        ...prevState,
        userDoc: null,
      }));
      return;
    }

    const userDocRef = doc(db, 'users', state.user.uid);
    const unsubscribeDoc = onSnapshot(
      userDocRef,
      (docSnapshot: DocumentSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserDoc;
          setState(prevState => ({
            ...prevState,
            userDoc: {
              id: docSnapshot.id,
              ...userData,
            },
          }));
        } else {
          setState(prevState => ({
            ...prevState,
            userDoc: null,
          }));
        }
      },
      (error) => {
        console.error('Error fetching user document:', error);
        setState(prevState => ({
          ...prevState,
          userDoc: null,
        }));
      }
    );

    return unsubscribeDoc;
  }, [state.user]);

  const contextValue = React.useMemo<AuthContextValue>(() => ({
    user: state.user,
    userDoc: state.userDoc,
    loading: state.loading,
  }), [state.user, state.userDoc, state.loading]);

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}