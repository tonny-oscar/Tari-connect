import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  getDocs,
  query,
  collection,
  where
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@tariconnect.com',
  password: 'admin123',
  name: 'Admin User'
};

// Create default admin user if it doesn't exist
export const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', DEFAULT_ADMIN.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      DEFAULT_ADMIN.email, 
      DEFAULT_ADMIN.password
    );
    
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: DEFAULT_ADMIN.name
    });
    
    // Create user document in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: 'admin',
      status: 'active',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    console.log('Default admin user created successfully');
  } catch (error) {
    // If user already exists in Auth but not in Firestore
    if (error.code === 'auth/email-already-in-use') {
      try {
        // Sign in with the default credentials
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          DEFAULT_ADMIN.email, 
          DEFAULT_ADMIN.password
        );
        
        const user = userCredential.user;
        
        // Check if user document exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // Create user document in Firestore with admin role
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: DEFAULT_ADMIN.email,
            name: DEFAULT_ADMIN.name,
            role: 'admin',
            status: 'active',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          
          console.log('Admin user document created in Firestore');
        }
        
        // Sign out after creating the user
        await signOut(auth);
      } catch (innerError) {
        console.error('Error creating admin user document:', innerError);
      }
    } else {
      console.error('Error creating default admin:', error);
    }
  }
};

// Register a new user
export const registerUser = async (email, password, name) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      name,
      role: 'user',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    return { success: true, user };
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
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    
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

// Auth state observer
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};