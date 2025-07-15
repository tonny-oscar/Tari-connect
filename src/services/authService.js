import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  query,
  collection,
  where
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { createDualDocument, updateDualDocument } from './dualDatabaseService';
import { startFreeTrial } from './freeTrialService';

// Make existing user admin
export const makeUserAdmin = async (email) => {
  try {
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDualDocument('users', userDoc.id, {
        role: 'admin',
        status: 'active'
      });
      console.log(`User ${email} has been made admin`);
      return { success: true };
    } else {
      console.log(`User ${email} not found`);
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error making user admin:', error);
    return { success: false, error: error.message };
  }
};

// Initialize admin users
export const initializeAdminUsers = async () => {
  try {
    // List of admin emails
    const adminEmails = ['betttonny26@gmail.com'];
    
    for (const email of adminEmails) {
      await makeUserAdmin(email);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing admin users:', error);
    return { success: false, error: error.message };
  }
};

// Register a new user
export const registerUser = async (email, password, name) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Check if this email should be admin
    const adminEmails = ['betttonny26@gmail.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';
    
    // Create user document in both databases
    await createDualDocument('users', user.uid, {
      uid: user.uid,
      email,
      name,
      role,
      status: 'active',
      emailVerified: user.emailVerified,
      createdAt: new Date().toISOString()
    });
    
    // Start 14-day free trial for new users
    await startFreeTrial(user.uid);
    
    return { 
      success: true, 
      user,
      message: 'Registration successful! A verification email has been sent to confirm your email address.'
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login timestamp
    await updateDualDocument('users', user.uid, {
      lastLogin: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
};

// Get current user data from Firestore
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, userData: userDoc.data() };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is admin
export const isUserAdmin = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Resend verification email
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return { success: true, message: 'Verification email sent! Please check your inbox.' };
    } else {
      return { success: false, error: 'No user found or email already verified.' };
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};