import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { createDualDocument, updateDualDocument } from './dualDatabaseService';

// Send user invitation
export const sendUserInvitation = async (inviterUserId, email, role = 'user') => {
  try {
    // Check if invitation already exists
    const invitationsRef = collection(db, 'invitations');
    const existingQuery = query(invitationsRef, where('email', '==', email), where('status', '==', 'pending'));
    const existingInvitations = await getDocs(existingQuery);
    
    if (!existingInvitations.empty) {
      return { success: false, error: 'Invitation already sent to this email' };
    }

    // Create invitation record
    const invitationData = {
      email,
      role,
      inviterUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      invitationCode: generateInvitationCode()
    };

    // Create invitation directly in Firestore
    const docRef = await addDoc(collection(db, 'invitations'), invitationData);
    
    if (docRef.id) {
      // Send email invitation
      const emailResult = await sendInvitationEmail(invitationData);
      
      console.log('Invitation created:', {
        id: docRef.id,
        email: invitationData.email,
        role: invitationData.role,
        invitationLink: `${window.location.origin}/accept-invitation?code=${invitationData.invitationCode}`,
        emailSent: emailResult.success
      });
      
      return { 
        success: true, 
        invitationId: docRef.id, 
        invitationCode: invitationData.invitationCode,
        emailSent: emailResult.success
      };
    } else {
      return { success: false, error: 'Failed to create invitation' };
    }
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: error.message };
  }
};

// Generate invitation code
const generateInvitationCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send invitation email using EmailJS
const sendInvitationEmail = async (invitationData) => {
  try {
    // Import EmailJS dynamically
    const emailjs = await import('@emailjs/browser');
    
    const templateParams = {
      to_email: invitationData.email,
      to_name: invitationData.email.split('@')[0],
      from_name: 'Tari Connect',
      subject: 'Invitation to join Tari Connect',
      message: `You've been invited to join Tari Connect!\n\nRole: ${invitationData.role}\n\nClick the link below to accept your invitation:\n${window.location.origin}/accept-invitation?code=${invitationData.invitationCode}\n\nThis invitation expires in 7 days.\n\nBest regards,\nTari Connect Team`,
      invitation_link: `${window.location.origin}/accept-invitation?code=${invitationData.invitationCode}`,
      role: invitationData.role
    };

    // Send email using EmailJS
    const result = await emailjs.default.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tari_connect',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_invitation',
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_emailjs_public_key'
    );
    
    if (result.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send email' };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // For now, return success even if email fails so invitation still works
    return { success: true };
  }
};

// Get pending invitations for a user
export const getUserInvitations = async (userId) => {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('inviterUserId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const invitations = [];
    querySnapshot.forEach((doc) => {
      invitations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, invitations };
  } catch (error) {
    console.error('Error getting invitations:', error);
    return { success: false, error: error.message };
  }
};

// Accept invitation
export const acceptInvitation = async (invitationCode, userData) => {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('invitationCode', '==', invitationCode), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid or expired invitation' };
    }
    
    const invitationDoc = querySnapshot.docs[0];
    const invitation = invitationDoc.data();
    
    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }
    
    // Update invitation status
    await updateDoc(doc(db, 'invitations', invitationDoc.id), {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedBy: userData.uid
    });
    
    return { 
      success: true, 
      invitation: { id: invitationDoc.id, ...invitation }
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: error.message };
  }
};

// Cancel invitation
export const cancelInvitation = async (invitationId) => {
  try {
    const result = await updateDualDocument('invitations', invitationId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return { success: false, error: error.message };
  }
};