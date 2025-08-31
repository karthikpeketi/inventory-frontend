import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Lock, ArrowRight, CheckCircle, AlertCircle, Shield, RefreshCw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label';
import authService from '../../api/authService';
import { toast } from '../../hooks/use-toast';
import useOtpTimer from '../../hooks/useOtpTimer'; // Import the custom hook
import { toastUtils } from '../../components/ui/toast.jsx';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';

const ResetPasswordOtp = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { timeLeft, isTimerActive, startTimer, resetTimer, formatTime } = useOtpTimer('resetPasswordOtpResendTimer');

  useEffect(() => {
    // SECURITY FIX: Clear any existing session data when accessing reset password OTP page
    ensureCleanAuthState();
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
    // If the component mounts and a timer is active from localStorage, it will automatically resume.
    // No explicit check needed here due to useOtpTimer's internal logic.
  }, [location.state, navigate]);

  // Clear timer if OTP is successfully verified or component unmounts
  useEffect(() => {
    if (step === 'reset' && status === 'pending') { // OTP verified, moving to reset password step
      resetTimer();
    }
    // No need for cleanup on unmount, useOtpTimer handles clearInterval internally
  }, [step, status, resetTimer]);


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setStatus('error');
      setMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setStatus('pending');

    try {
      const response = await authService.verifyPasswordResetOtp(email, otp);
      
      if (response.verified) {
        setStep('reset');
        setStatus('pending');
        setMessage('');
        toastUtils.patterns.auth.otpVerified(toast, "Please enter your new password.");
        resetTimer(); // Clear timer on successful verification
      } else {
        setStatus('error');
        setMessage('Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setStatus('pending');

    try {
      await authService.resetPasswordWithOtp(email, otp, newPassword);
      
      setStatus('success');
      setMessage('Password reset successful! Redirecting to login...');
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
      
      // SECURITY FIX: Ensure session data is cleared before redirecting to login
      ensureCleanAuthState();
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive || isResending) return; // Use isTimerActive from hook

    setIsResending(true);
    try {
      await authService.forgotPasswordOtp(email);
      startTimer(); // Start timer using the hook
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
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
            {step === 'verify' ? 'Verify your identity' : 'Create a new password'}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {step === 'verify' 
              ? 'Enter the 6-digit code sent to your email to verify your identity.'
              : 'Choose a strong password to secure your account and keep your inventory data safe.'
            }
          </p>
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
              {step === 'verify' ? 'Enter verification code' : 'Reset your password'}
            </h2>
            <p className="text-gray-600 mb-8">
              {step === 'verify' 
                ? `We sent a code to ${email}`
                : 'Enter your new password below'
              }
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
            ) : step === 'verify' ? (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleVerifyOtp}
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

                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </Label>
                  <div className="mt-2 relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-10 text-center text-lg tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
                    disabled={isTimerActive || isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : isTimerActive ? (
                      <span className="text-primary">Resend in {formatTime(timeLeft)}</span>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading || otp.length !== 6}
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Verify Code</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Link 
                    to="/forgot-password" 
                    state={{ email: email }} // Pass email back
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to reset options
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleResetPassword}
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

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Resetting...</span>
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

export default ResetPasswordOtp;
