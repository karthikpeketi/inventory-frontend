import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Input } from "../../components/ui/input.jsx";
import { Button } from '../../components/ui/button.jsx';
import { Package, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, UserCheck } from 'lucide-react';
import { Label } from '../../components/ui/label';
import PasswordStrengthIndicator from '../../components/ui/PasswordStrengthIndicator.jsx';

import { useToast, toastUtils } from '../../components/ui/use-toast';
import { authService } from '../../api';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';

const ActivateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: tokenFromParams } = useParams();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get token from URL params or query string
  const queryToken = new URLSearchParams(location.search).get('token');
  const token = tokenFromParams || queryToken;

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // SECURITY FIX: Clear any existing session data when accessing activation page
    // This prevents session mixing when activating a different user's account
    ensureCleanAuthState();
    if (!token) {
      setStatus("error");
      setMessage("No activation token found in the URL.");
      return;
    }

    // Verify the token and get user info
    authService.validateActivationToken(token)
      .then((data) => {
        setStatus("ready");
        setUserData(data);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          (error.response && error.response.data && error.response.data.message) ||
          "Activation link is invalid or has expired. Please contact your administrator."
        );
      });
  }, [token, baseURL]);

  const handleActivation = (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage("Please enter and confirm your password.");
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    
    authService.activateAccount(token, password)
      .then(() => {
        setStatus("success");
        setMessage("Your account has been activated successfully! Redirecting to login...");
        // SECURITY FIX: Ensure session data is cleared before redirecting to login
        ensureCleanAuthState();
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          (error.response && error.response.data && error.response.data.message) ||
          "Account activation failed. Please try again or contact support."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
            {status === 'ready' ? 'Activate your account' : 
             status === 'success' ? 'Welcome aboard!' : 
             'Setting up your account'}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {status === 'ready' ? 'Create a secure password to complete your account setup and start managing your inventory.' :
             status === 'success' ? 'Your account has been successfully activated. You can now access all features of our inventory management system.' :
             'Please wait while we verify your activation link and prepare your account.'}
          </p>

          {userData && status === 'ready' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Welcome, {userData.firstName} {userData.lastName}!
                  </p>
                  <p className="text-xs text-blue-700">
                    Account: {userData.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Side - Form */}
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
              {status === 'ready' ? 'Set your password' :
               status === 'success' ? 'Account activated!' :
               status === 'error' ? 'Activation failed' :
               'Activating account...'}
            </h2>
            <p className="text-gray-600 mb-8">
              {status === 'ready' ? 'Choose a strong password to secure your account' :
               status === 'success' ? 'Redirecting you to the login page...' :
               status === 'error' ? 'There was an issue with your activation link' :
               'Please wait while we verify your activation token'}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200">
            {status === "pending" && (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <p className="text-gray-600">Verifying your activation link...</p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-red-100 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-display text-gray-900 mb-4">
                  Activation Failed
                </h3>
                <p className="text-red-600 mb-6">{message}</p>
                <Link to="/login">
                  <Button className="w-full group">
                    <div className="flex items-center justify-center space-x-2">
                      <span>Return to Login</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            )}

            {status === "success" && (
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
                  Account Activated Successfully!
                </h3>
                <p className="text-green-600 mb-6">{message}</p>
                <Link to="/login">
                  <Button className="w-full group">
                    <div className="flex items-center justify-center space-x-2">
                      <span>Continue to Login</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            )}

            {status === "ready" && (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleActivation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {message && (
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

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10"
                      placeholder="Enter your new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <PasswordStrengthIndicator password={password} showCriteria={true} />
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10"
                      placeholder="Confirm your new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Password Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Password Guidelines:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Use at least 6 characters</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Add at least one number</li>
                    <li>• Consider using special characters for extra security</li>
                  </ul>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading || !password || !confirmPassword}
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Activate Account</span>
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

export default ActivateAccount;
