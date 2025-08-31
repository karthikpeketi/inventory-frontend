/**
 * Session Security Utilities
 * 
 * This module provides utilities to enhance session security and prevent
 * session mixing between different users in the same browser.
 */

import { STORAGE_KEYS } from '../constants/auth';

/**
 * Clears all session data from localStorage
 * This should be called whenever we need to ensure a clean session state
 */
export const clearAllSessionData = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.LOGIN_METHOD);
  
  // Clear any OTP timers that might be running
  const otpKeys = [
    'resetPasswordOtpResendTimer',
    'forgotPasswordOtpResendTimer',
    'emailVerificationOtpTimer'
  ];
  
  otpKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Validates if the current session data is complete and valid
 * @returns {boolean} true if session is valid, false otherwise
 */
export const validateSessionData = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (!token || !userData) {
      return false;
    }
    
    const parsedUserData = JSON.parse(userData);
    
    // Check if all required user data fields are present
    if (!parsedUserData || 
        !parsedUserData.id || 
        !parsedUserData.username || 
        !parsedUserData.email) {
      return false;
    }
    
    return true;
  } catch (error) {
    // If there's any error parsing the data, consider it invalid
    return false;
  }
};

/**
 * Gets the current user ID from session data
 * @returns {string|null} user ID or null if not found
 */
export const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;
    
    const parsedUserData = JSON.parse(userData);
    return parsedUserData?.id || null;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if there's a session conflict (different user trying to access)
 * This can be used to detect when a different user is trying to access the system
 * @param {string} expectedUserId - The expected user ID
 * @returns {boolean} true if there's a conflict, false otherwise
 */
export const hasSessionConflict = (expectedUserId) => {
  const currentUserId = getCurrentUserId();
  return currentUserId && currentUserId !== expectedUserId;
};

/**
 * Forces a clean session state
 * This should be called before any authentication operation to ensure
 * no previous session data interferes with the new session
 */
export const forceCleanSession = () => {
  clearAllSessionData();
  
  // Also clear any cached authentication state that might exist
  // This ensures a completely fresh start
  sessionStorage.clear();
};

/**
 * Session security middleware for authentication pages
 * This should be called on all authentication-related pages to ensure
 * no session mixing occurs
 */
export const ensureCleanAuthState = () => {
  // Clear all session data when accessing auth pages
  forceCleanSession();
  
  // Log the security action for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[SessionSecurity] Cleared session data for authentication page');
  }
};

/**
 * Validates and sanitizes session data on app initialization
 * @returns {object|null} valid user data or null if invalid
 */
export const validateAndSanitizeSession = () => {
  if (!validateSessionData()) {
    clearAllSessionData();
    return null;
  }
  
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return JSON.parse(userData);
  } catch (error) {
    clearAllSessionData();
    return null;
  }
};