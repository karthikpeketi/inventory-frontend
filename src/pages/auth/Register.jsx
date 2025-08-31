import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, UserPlus, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label';
import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator';

import { useAuth } from '../../context/AuthContext.jsx';
import { calculatePasswordStrength } from '../../utils/passwordStrength';
import { validateName, validateEmail, normalizeEmail } from '../../utils/validation';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const { isAuthenticating, register } = useAuth();

  // SECURITY FIX: Clear any existing session data when register page loads
  useEffect(() => {
    ensureCleanAuthState();
  }, []);

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleNameChange = (value, setter, fieldName) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
    setter(filteredValue);
    clearFieldError(fieldName);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate first name
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error;
    }

    // Validate last name
    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Validate password
    const { criteria } = calculatePasswordStrength(password);
    if (!criteria.length) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setServerMessage('');
    try {
      // Register using the context's register function
      await register(firstName, lastName, email, password);
      // If successful, the context will handle navigation
    } catch (err) {
      // Errors are handled by the context, but we can display a fallback message if needed
      setServerMessage(err?.response?.data?.message || err?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Left Side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-20 xl:px-24"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-2xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold font-display gradient-text">
              Inventory360
            </span>
          </div>
          
          <h1 className="text-4xl font-bold font-display text-gray-900 mb-6">
            Join Our Platform
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Create your account and start managing your inventory efficiently with our modern solutions.
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center lg:hidden mb-8">
            <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-2xl">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/90">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="mt-1">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      disabled={isAuthenticating}
                      value={firstName}
                      onChange={(e) => handleNameChange(e.target.value, setFirstName, 'firstName')}
                      className={`block w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="mt-1">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      disabled={isAuthenticating}
                      value={lastName}
                      onChange={(e) => handleNameChange(e.target.value, setLastName, 'lastName')}
                      className={`block w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isAuthenticating}
                    value={email}
                    onChange={(e) => {
                      // Normalize email input
                      const normalizedEmail = normalizeEmail(e.target.value);
                      setEmail(normalizedEmail);
                      clearFieldError('email');
                    }}
                    className={`block w-full ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isAuthenticating}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    className={`block w-full ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <div
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isAuthenticating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isAuthenticating && setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                {password && (
                  <div className="mt-3">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isAuthenticating}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    className={`block w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <div
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isAuthenticating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isAuthenticating && setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            {serverMessage && (
              <div className="text-sm text-center text-red-600 mt-2">
                {serverMessage}
              </div>
            )}
            <Button
              type="submit"
              className="w-full group"
              disabled={isAuthenticating}
              size="lg"
            >
              {isAuthenticating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default Register;
