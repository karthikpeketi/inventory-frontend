/**
 * Validation utilities for form inputs
 */

// Name validation - only letters, spaces, hyphens, and apostrophes
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Must be less than 50 characters long' };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Only letters, spaces, hyphens, and apostrophes are allowed' };
  }
  
  // Check for consecutive spaces or special characters
  if (/[\s\-']{2,}/.test(name.trim())) {
    return { isValid: false, error: 'No consecutive spaces or special characters allowed' };
  }
  
  // Check if it starts or ends with space, hyphen, or apostrophe
  if (/^[\s\-']|[\s\-']$/.test(name.trim())) {
    return { isValid: false, error: 'Cannot start or end with spaces or special characters' };
  }
  
  return { isValid: true, error: '' };
};

// Email validation with proper domain checking and normalization
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Normalize email: trim and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase();
  
  // Enhanced email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Check for valid domain structure
  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  const [localPart, domain] = parts;
  
  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check for consecutive dots in local part
  if (localPart.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots' };
  }
  
  // Check if local part starts or ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'Email cannot start or end with a dot' };
  }
  
  // Domain validation
  if (domain.length === 0 || domain.length > 255) {
    return { isValid: false, error: 'Invalid email domain' };
  }
  
  // Check if domain has at least one dot and proper structure
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, error: 'Please enter a complete email address (e.g., user@example.com)' };
  }
  
  // Check each domain part
  for (const part of domainParts) {
    if (part.length === 0 || part.length > 63) {
      return { isValid: false, error: 'Invalid email domain format' };
    }
    
    // Domain parts should only contain letters, numbers, and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return { isValid: false, error: 'Invalid characters in email domain' };
    }
    
    // Domain parts cannot start or end with hyphen
    if (part.startsWith('-') || part.endsWith('-')) {
      return { isValid: false, error: 'Invalid email domain format' };
    }
  }
  
  // Last domain part (TLD) should be at least 2 characters and only letters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Please enter a valid email domain (e.g., .com, .org)' };
  }
  
  // Additional validation for common email patterns
  // Check for valid common domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com'];
  const isCommonDomain = commonDomains.includes(domain);
  
  // If it's a common domain but seems malformed, provide specific guidance
  if (domain.includes('gmail') && domain !== 'gmail.com') {
    return { isValid: false, error: 'Did you mean @gmail.com?' };
  }
  if (domain.includes('yahoo') && domain !== 'yahoo.com') {
    return { isValid: false, error: 'Did you mean @yahoo.com?' };
  }
  if (domain.includes('hotmail') && domain !== 'hotmail.com') {
    return { isValid: false, error: 'Did you mean @hotmail.com?' };
  }
  if (domain.includes('outlook') && domain !== 'outlook.com') {
    return { isValid: false, error: 'Did you mean @outlook.com?' };
  }
  
  return { isValid: true, error: '', normalizedEmail };
};

// Email normalization utility
export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

// Generic field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: '' };
};