
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { useRouter } from 'next/navigation';
import { createInitialProgress } from '@/lib/course-utils';


interface FullUser extends User {
    nilePoints?: number;
}
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: FullUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: FullUser | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: FullUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: FullUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  firestore?: Firestore;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 * It contains the critical logic for user profile hydration.
 *
 * @remarks
 * ## User Profile Hydration Logic
 * When a user signs in, the `onAuthStateChanged` listener receives a basic `firebaseUser` object from Firebase Auth.
 * To provide a rich user object throughout the app, this provider performs a "hydration" process:
 *
 * 1.  **On User Sign-In (`firebaseUser` is present):**
 *     a.  A reference to the user's profile document is created at `/users/{firebaseUser.uid}`.
 *     b.  The provider attempts to `getDoc` for this reference.
 *
 * 2.  **Scenario A: Existing User (`userDoc.exists()` is true):**
 *     - The data from the Firestore document (which includes custom fields like `nilePoints` and `alias`) is retrieved.
 *     - This Firestore data is merged with the basic `firebaseUser` object to create a `FullUser`.
 *     - The `displayName` in the final user object prioritizes the `alias` from Firestore, ensuring the "pharaonic alias" is used consistently.
 *
 * 3.  **Scenario B: New User (`userDoc.exists()` is false):**
 *     - This indicates the user's first-ever login.
 *     - A new user document is created in Firestore using the user's `uid`, `email`, and the `displayName` they provided during sign-up.
 *     - The `alias` is set to their `displayName`, and `nilePoints` are initialized to 0.
 *     - The `createInitialProgress` utility is called to set up their starting point in the learning path.
 *     - The user is automatically redirected to the `/goals` page for their initial onboarding experience.
 *
 * 4.  **On User Sign-Out (`firebaseUser` is null):**
 *     - The user state is cleared, setting `user` to `null`.
 *
 * This process ensures that any component using the `useUser` hook receives a complete and consistent user profile,
 * abstracting away the complexity of data fetching and creation.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const router = useRouter();
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          
          try {
            const userDoc = await getDoc(userDocRef);
            let userData: DocumentData | undefined;
            
            if (userDoc.exists()) {
              userData = userDoc.data();
            } else {
              console.log(`User document for ${firebaseUser.uid} not found. Creating a new profile...`);
              const newUserDoc = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || 'New Queen', 
                  alias: firebaseUser.displayName || `ملكة ${firebaseUser.uid.substring(0,5)}`, 
                  registrationDate: new Date().toISOString(),
                  nilePoints: 0,
              };
              await setDoc(userDocRef, newUserDoc);
              userData = newUserDoc;
              
              await createInitialProgress(firestore, firebaseUser.uid);

               router.push('/goals');
            }
            
            const fullUser: FullUser = {
              ...firebaseUser,
              nilePoints: userData?.nilePoints ?? 0,
              displayName: userData?.alias || firebaseUser.displayName, 
            };

            setUserAuthState({ user: fullUser, isUserLoading: false, userError: null });

          } catch (error) {
             console.error("Error during user profile hydration:", error);
             setUserAuthState({ user: firebaseUser as FullUser, isUserLoading: false, userError: error as Error });
          }

        } else {
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore, router]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider.');
  }
  return context.auth;
};

export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider.');
  }
  return context.firestore;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider.');
  }
  return context.firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  if(!('__memo' in memoized)) {
     (memoized as MemoFirebase<T>).__memo = true;
  }
  
  return memoized;
}


export const useUser = (includeFirestore = false): UserHookResult => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  
  const { user, isUserLoading, userError, firestore } = context;
  
  if (includeFirestore) {
    return { user, isUserLoading, userError, firestore: firestore ?? undefined };
  }
  
  return { user, isUserLoading, userError };
};
    