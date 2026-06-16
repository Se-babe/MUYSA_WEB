import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { refreshMemberStats } from './firestore';

const authErrors = {
  'auth/email-already-in-use': 'Email already registered',
  'auth/invalid-email': 'Invalid email address',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/user-not-found': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
};

export const mapAuthError = (error) =>
  authErrors[error?.code] || error?.message || 'Authentication failed';

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const registerUser = async ({ full_name, email, password, phone, role, course }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const userRole = ['student', 'alumni'].includes(role) ? role : 'student';
  const userData = {
    full_name,
    email,
    phone: phone || null,
    course: course?.trim() || '',
    role: userRole,
    profile_photo: null,
    bio: '',
    is_verified: false,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), userData);

  if (userRole === 'student') {
    await setDoc(doc(db, 'student_profiles', cred.user.uid), {
      user_id: cred.user.uid,
      course: userData.course,
      updated_at: serverTimestamp(),
    });
  } else if (userRole === 'alumni') {
    await setDoc(doc(db, 'alumni_profiles', cred.user.uid), {
      user_id: cred.user.uid,
      course: userData.course,
      updated_at: serverTimestamp(),
    });
  }

  await refreshMemberStats();
  return { id: cred.user.uid, ...userData };
};

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) throw new Error('User profile not found');
  const data = snap.data();
  if (data.is_active === false) throw new Error('Account is deactivated');
  return { id: cred.user.uid, ...data };
};

export const logoutUser = () => signOut(auth);

export const subscribeToAuth = (callback) =>
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.is_active === false) {
        await signOut(auth);
        callback(null);
        return;
      }
      callback({ id: firebaseUser.uid, ...data });
    } else {
      callback(null);
    }
  });
