import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Package, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label';
import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../../utils/passwordStrength';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // SECURITY FIX: Clear any existing session data when accessing reset password page
    ensureCleanAuthState();
    if (!token) {
      setStatus('error');
      setMessage('No reset token found in the URL.');
      setTokenValid(false);
      return;
    }
    
    // Validate token with backend on component mount
    verifyRestToken(token);
  }, [token]);

  const verifyRestToken = async (tokenToVerify) => {
    setIsVerifyingToken(true);
    try {
      const response = await axios.get(`${baseURL}/auth/verify-reset-token`, {
        params: { token: tokenToVerify }
      });
      
      if (response.data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setStatus('error');
        setMessage(response.data.message || 'Invalid or expired reset token.');
        // Auto-redirect to forgot-password after 5 seconds
        setTimeout(() => {
          navigate('/forgot-password', { replace: true });
        }, 5000);
      }
    } catch (error) {
      setTokenValid(false);
      setStatus('error');
      const errorMessage = error.response?.data?.message || 'Unable to verify reset token. The link may be invalid or expired.';
      setMessage(errorMessage);
      console.error('Token verification error:', error);
      // Auto-redirect to forgot-password after 5 seconds
      setTimeout(() => {
        navigate('/forgot-password', { replace: true });
      }, 5000);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general status error when user starts typing
    if (status === 'error') {
      setStatus('pending');
      setMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { criteria } = calculatePasswordStrength(newPassword);

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!criteria.length) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const { criteria } = calculatePasswordStrength(newPassword);
    return newPassword && 
           confirmPassword && 
           newPassword === confirmPassword &&
           criteria.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setStatus('pending');

    try {
      await axios({
        method: 'post',
        url: `${baseURL}/auth/reset-password`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          token,
          newPassword,
        },
      });

      setStatus('success');
      setMessage('Password reset successful! Redirecting to login...');
      
      // SECURITY FIX: Ensure session data is cleared before redirecting to login
      ensureCleanAuthState();
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data || 'Password reset failed. The link may have expired or is invalid.';
      setMessage(typeof errorMessage === 'string' ? errorMessage : 'Password reset failed. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying token
  if (isVerifyingToken) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-2xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold font-display gradient-text">
                  Inventory360
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200 text-center">
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-xl font-bold font-display text-gray-900 mb-4">
                Verifying Reset Link
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-2xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold font-display gradient-text">
                  Inventory360
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold font-display text-gray-900 mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-4">
                {message || 'This password reset link is invalid or has expired.'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will be redirected to request a new reset link in a few seconds...
              </p>
              <Link to="/forgot-password">
                <Button className="w-full flex items-center justify-center">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
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
            Create a new password
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Choose a strong password to secure your account and keep your inventory data safe.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Reset Form */}
      <motion.div 
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden mb-8">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-3 bg-gradient-to-r from-primary to-blue-600 rounded-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold font-display gradient-text">
                Inventory360
              </span>
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-600 mb-8">
              Enter your new password below
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200">
            {status === 'success' ? (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-display text-gray-900 mb-4">
                  Password Reset Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated. You will be redirected to the login page shortly.
                </p>
                <Link to="/login">
                  <Button className="w-full group">
                    <div className="flex items-center justify-center space-x-2">
                      <span>Continue to Login</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {status === 'error' && (
                  <motion.div 
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-red-700">{message}</p>
                    </div>
                  </motion.div>
                )}

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className="block w-full pl-10 pr-10"
                      placeholder="Enter your new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm">{errors.newPassword}</p>
                  )}
                  {newPassword && (
                    <div className="mt-3">
                      <PasswordStrengthIndicator password={newPassword} />
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={handlePasswordChange}
                      className="block w-full pl-10 pr-10"
                      placeholder="Confirm your new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                  )}
                  {confirmPassword && newPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Resetting password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Reset Password</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to sign in
                  </Link>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
