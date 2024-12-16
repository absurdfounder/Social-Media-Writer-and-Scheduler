import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const firebaseConfig = {
  apiKey: "AIzaSyAvm-GVWRRFZIjD_wui9N3buRbgsEU7_Sw",
  authDomain: "fetchkitty-app.firebaseapp.com",
  projectId: "fetchkitty-app",
  storageBucket: "fetchkitty-app.firebasestorage.app",
  messagingSenderId: "786550008641",
  appId: "1:786550008641:web:23d7450458e2b383a0cfc0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      fetchSubscriptionStatus(parsedUserData.uid);
    }
  }, []);

  const fetchSubscriptionStatus = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSubscription(userData.subscription || null);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const saveUserToFirestore = async (userData) => {
    try {
      const userRef = doc(db, 'users', userData.uid);
      const userDoc = await getDoc(userRef);
      const existingData = userDoc.exists() ? userDoc.data() : null;
  
      await setDoc(userRef, {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        lastLogin: serverTimestamp(),
        createdAt: existingData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        subscription: existingData?.subscription || {
          status: 'free',
          planType: null,
          planName: null,
          startDate: null,
          endDate: null
        }
      }, { merge: true });
  
      await fetchSubscriptionStatus(userData.uid);
      console.log('User data saved to Firestore');
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      toast.error('Error updating user profile');
    }
  };
  

  const getErrorMessage = (error) => {
    // Clean up the error code by removing the 'auth/' prefix
    const errorCode = error.code?.replace('auth/', '') || '';

    switch (errorCode) {
      case 'operation-not-allowed':
        return 'Sign in is temporarily unavailable. Please try again later.';
      case 'popup-blocked':
        return 'Sign in popup was blocked. Please allow popups for this site and try again.';
      case 'popup-closed-by-user':
        return 'Sign in was cancelled. Please try again.';
      case 'cancelled-popup-request':
        return 'Please try signing in again.';
      case 'network-request-failed':
        return 'Unable to connect. Please check your internet connection and try again.';
      case 'user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'user-not-found':
        return 'No account found with these credentials.';
      case 'account-exists-with-different-credential':
        return 'An account already exists with this email. Please try a different sign-in method.';
      case 'internal-error':
        return 'Something went wrong on our end. Please try again later.';
      case 'timeout':
        return 'Request timed out. Please check your internet connection and try again.';
      case 'too-many-requests':
        return 'Too many sign in attempts. Please wait a few minutes before trying again.';
      case 'invalid-credential':
      case 'invalid-email':
      case 'invalid-verification-code':
        return 'Invalid sign in credentials. Please try again.';
      default:
        console.error('Authentication error:', error);
        return 'Unable to sign in at this time. Please try again later.';
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
  
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
  
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Basic user data from Google Auth
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      };
  
      // Save auth token
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
  
      // Save user data to Firestore first
      await saveUserToFirestore(userData);
  
      // Fetch complete user data from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Combine Firestore data with auth data
        const firestoreData = userDoc.data();
        const completeUserData = {
          ...userData,
          ...firestoreData,
          // Convert Firestore Timestamps to ISO strings for localStorage
          lastLogin: new Date().toISOString(),
          createdAt: firestoreData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: firestoreData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastSeen: firestoreData.lastSeen?.toDate?.()?.toISOString() || new Date().toISOString(),
          // Ensure subscription data is included
          subscription: firestoreData.subscription || {
            status: 'free',
            planType: null,
            planName: null,
            startDate: null,
            endDate: null
          }
        };
  
        // Save complete user data to localStorage
        localStorage.setItem('userData', JSON.stringify(completeUserData));
        setUser(completeUserData);
        setSubscription(completeUserData.subscription);
  
        console.log('Complete user data saved:', completeUserData);
        toast.success(`Welcome${user.displayName ? ` ${user.displayName}` : ''}! 👋`);
  
        // Check if user has an active subscription
        if (completeUserData.subscription?.status === 'active') {
          toast.success(`Active ${completeUserData.subscription.planName || 'subscription'} found! 🎉`);
        }
      } else {
        // If no Firestore document exists yet
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        toast.success(`Welcome${user.displayName ? ` ${user.displayName}` : ''}! 👋`);
      }
  
      window.dispatchEvent(new Event('userLoggedIn'));
  
    } catch (err) {
      console.error('Login error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      if (user?.uid) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          lastSeen: serverTimestamp(),
          status: 'offline'
        }, { merge: true });
      }

      await signOut(auth);
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      setUser(null);
      setSubscription(null);
      toast.success('You have been signed out successfully. See you again soon! 👋');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionBadge = () => {
    if (!subscription || subscription.status === 'free') return null;

    const getBadgeColor = () => {
      switch (subscription.planName) {
        case 'lifetime':
          return 'bg-purple-500';
        case 'monthly':
          return 'bg-blue-500';
        default:
          return 'bg-gray-500';
      }
    };

    return (
      <div className={`${getBadgeColor()} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ml-2`}>
        <span>
          {subscription.planName === 'lifetime' ? '∞' : '★'}
        </span>
        <span className="capitalize">
          {subscription.planName || subscription.planType}
        </span>
      </div>
    );
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-pulse">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
          </div>
          <span>Processing...</span>
        </>
      );
    }

    if (user) {
      return (
        <>
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
              )}
              <span className="truncate max-w-[150px]">{user.displayName || user.email}</span>
            </div>
            {renderSubscriptionBadge()}
          </div>
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </>
      );
    }

    return (
      <>
        <div>
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
        </div>
        <span>Sign in with Google</span>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={user ? handleLogout : handleGoogleLogin}
        disabled={loading}
        className={`min-w-64 h-16 bg-slate-800 text-white rounded-full py-4 px-4 flex items-center justify-center space-x-2 mb-4 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed ${user ? 'hover:bg-red-600' : 'hover:bg-orange-600'
          }`}
      >
        {renderButtonContent()}
      </button>
    </div>
  );
};

export default Login;