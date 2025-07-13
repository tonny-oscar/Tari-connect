import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { canAddUser } from './subscriptionService';

// Add team member
export const addTeamMember = async (organizationId, memberData) => {
  try {
    // Check if organization can add more users
    const canAddResult = await canAddUser(organizationId);
    
    if (!canAddResult.success) {
      return { success: false, error: canAddResult.error };
    }
    
    if (!canAddResult.canAdd) {
      return { 
        success: false, 
        error: `User limit reached. Your plan allows ${canAddResult.limit} users.` 
      };
    }
    
    const teamMember = {
      organizationId,
      email: memberData.email,
      role: memberData.role || 'member',
      status: 'pending', // pending, active, inactive
      invitedAt: new Date(),
      invitedBy: memberData.invitedBy,
      permissions: memberData.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'teamMembers'), teamMember);
    
    return { 
      success: true, 
      teamMemberId: docRef.id,
      remaining: canAddResult.remaining - 1
    };
  } catch (error) {
    console.error('Error adding team member:', error);
    return { success: false, error: error.message };
  }
};

// Get team members for organization
export const getTeamMembers = async (organizationId) => {
  try {
    const q = query(
      collection(db, 'teamMembers'),
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    const teamMembers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, teamMembers };
  } catch (error) {
    console.error('Error getting team members:', error);
    return { success: false, error: error.message };
  }
};

// Update team member status
export const updateTeamMemberStatus = async (teamMemberId, status) => {
  try {
    await updateDoc(doc(db, 'teamMembers', teamMemberId), {
      status,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating team member status:', error);
    return { success: false, error: error.message };
  }
};

// Remove team member
export const removeTeamMember = async (teamMemberId) => {
  try {
    await deleteDoc(doc(db, 'teamMembers', teamMemberId));
    return { success: true };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error: error.message };
  }
};

// Get team member by email and organization
export const getTeamMemberByEmail = async (organizationId, email) => {
  try {
    const q = query(
      collection(db, 'teamMembers'),
      where('organizationId', '==', organizationId),
      where('email', '==', email)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const memberDoc = snapshot.docs[0];
      return {
        success: true,
        teamMember: {
          id: memberDoc.id,
          ...memberDoc.data()
        }
      };
    }
    
    return { success: false, error: 'Team member not found' };
  } catch (error) {
    console.error('Error getting team member by email:', error);
    return { success: false, error: error.message };
  }
};

// Listen to team members changes
export const subscribeToTeamMembers = (organizationId, callback) => {
  const q = query(
    collection(db, 'teamMembers'),
    where('organizationId', '==', organizationId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const teamMembers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback({ success: true, teamMembers });
  });
};

// Get team member permissions
export const getTeamMemberPermissions = async (userId, organizationId) => {
  try {
    // Check if user is the organization owner
    const ownerDoc = await getDoc(doc(db, 'users', organizationId));
    if (ownerDoc.exists() && ownerDoc.data().email === userId) {
      return { 
        success: true, 
        permissions: ['all'], // Owner has all permissions
        role: 'owner'
      };
    }
    
    // Check team member permissions
    const q = query(
      collection(db, 'teamMembers'),
      where('organizationId', '==', organizationId),
      where('email', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const memberDoc = snapshot.docs[0];
      const memberData = memberDoc.data();
      
      return {
        success: true,
        permissions: memberData.permissions || [],
        role: memberData.role || 'member'
      };
    }
    
    return { success: false, error: 'Access denied' };
  } catch (error) {
    console.error('Error getting team member permissions:', error);
    return { success: false, error: error.message };
  }
};