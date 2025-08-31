/**
 * Password strength validation utility
 */

export const PASSWORD_CRITERIA = {
  MIN_LENGTH: 6,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /\d/,
  HAS_SYMBOL: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
};

export const checkPasswordCriteria = (password) => {
  return {
    length: password.length >= PASSWORD_CRITERIA.MIN_LENGTH,
    uppercase: PASSWORD_CRITERIA.HAS_UPPERCASE.test(password),
    lowercase: PASSWORD_CRITERIA.HAS_LOWERCASE.test(password),
    number: PASSWORD_CRITERIA.HAS_NUMBER.test(password),
    symbol: PASSWORD_CRITERIA.HAS_SYMBOL.test(password)
  };
};

export const calculatePasswordStrength = (password) => {
  if (!password) return { strength: 'none', score: 0, label: '' };
  
  const criteria = checkPasswordCriteria(password);
  const metCriteria = Object.values(criteria).filter(Boolean).length;
  
  let strength, score, label;
  
  if (metCriteria <= 1) {
    strength = 'weak';
    score = 1;
    label = 'Weak';
  } else if (metCriteria <= 3) {
    strength = 'medium';
    score = 2;
    label = 'Medium';
  } else {
    strength = 'strong';
    score = 3;
    label = 'Strong';
  }
  
  return { strength, score, label, criteria };
};

export const getStrengthColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'strong':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStrengthBarColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};