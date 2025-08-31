/**
 * Constants for user status reasons
 */
export const USER_STATUS = {
  // Admin created user
  PENDING_ACTIVATION: "PENDING_ACTIVATION",
  
  // Self-registered user waiting for approval
  PENDING_APPROVAL: "PENDING_APPROVAL",
  
  // Admin deactivated user
  DEACTIVATED: "DEACTIVATED_BY_ADMIN",
  
  // Admin rejected user
  REJECTED: "REJECTED_BY_ADMIN"
};

/**
 * Helper function to determine user state based on isActive and statusReason
 * @param {Object} user - User object with isActive and statusReason properties
 * @returns {String} - User state (ACTIVE, PENDING_APPROVAL, PENDING_ACTIVATION, DEACTIVATED, REJECTED, INACTIVE)
 */
export const getUserState = (user) => {
  if (user.isActive) return "ACTIVE";
  
  const statusReason = user.statusReason || "";
  if (statusReason === USER_STATUS.PENDING_APPROVAL) return "PENDING_APPROVAL";
  if (statusReason === USER_STATUS.PENDING_ACTIVATION) return "PENDING_ACTIVATION";
  if (statusReason === USER_STATUS.DEACTIVATED) return "DEACTIVATED";
  if (statusReason === USER_STATUS.REJECTED) return "REJECTED";
  
  // If no specific reason is provided, treat as DEACTIVATED only if the user was previously active
  // This ensures that admin-created users who haven't activated their account yet
  // don't show the "Reactivate" button
  if (!user.lastLoginDate) {
    // User has never logged in, so treat as PENDING_ACTIVATION
    return "PENDING_ACTIVATION";
  }
  
  // User was previously active but is now inactive, so treat as DEACTIVATED
  return "DEACTIVATED";
};