
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Mail, ArrowRight, ArrowLeft, CheckCircle, Shield, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label';
import { normalizeEmail } from '../../utils/validation';
import useOtpTimer from '../../hooks/useOtpTimer'; // Import the custom hook
import { useAuth } from '../../context/AuthContext.jsx';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetMethod, setResetMethod] = useState('link'); // 'link' or 'otp' - default to 'link'
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation hook
  const { timeLeft, isTimerActive, startTimer, formatTime } = useOtpTimer('resetPasswordOtpResendTimer'); // Initialize useOtpTimer and get timer state
  const {isAuthenticating, forgotPassword, forgotPasswordOtp} = useAuth(); // Get authentication state from context

  // Effect to populate email from location state and clear session
  useEffect(() => {
    // SECURITY FIX: Clear any existing session data when forgot password page loads
    ensureCleanAuthState();
    
    const emailFromState = location.state?.email; // Get email from location state

    if (emailFromState) {
      setEmail(normalizeEmail(emailFromState));
    }
  }, [location.state]);

    const handleSubmit = async (e) => {
      e.preventDefault();    
      if (resetMethod === 'link') {
        const { message } = await forgotPassword(email);
        if(message) {
          setSubmitted(true);
        }
      } else if (resetMethod === 'otp') {
        const {message} = await forgotPasswordOtp(email);
        if (message) {
          startTimer(); // Start the timer immediately after sending OTP
          // Navigate to OTP verification page
          navigate('/reset-password-otp', { state: { email } });
        }
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
            Forgot your password?
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            No worries! Choose how you'd like to reset your password - via email link or secure OTP verification.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Reset Form */}
      <motion.div 
        className="flex flex-1 flex-col justify-center items-center lg:items-start px-4 py-12 sm:px-6 lg:px-20 xl:px-24"
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

          <div
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-600 mb-8">
              Or{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                return to sign in
              </Link>
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200">
            {submitted ? (
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
                  Check your email
                </h3>
                <p className="text-gray-600 mb-6">
                  We have sent a password reset link to{' '}
                  <span className="font-semibold text-gray-900">{email}</span>.{' '}
                  Please check your inbox and follow the instructions to reset your password.
                </p>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full group flex items-center justify-center"
                    onClick={() => setSubmitted(false)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Try again
                  </Button>
                  <Link to="/login" className="w-full">
                    <Button variant="ghost" className="w-full flex items-center justify-center">
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose reset method
                  </Label>
                  <div className="space-y-3">
                    <motion.div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        resetMethod === 'link' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setResetMethod('link')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          resetMethod === 'link' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Email Link</h4>
                          <p className="text-sm text-gray-600">Receive a secure link via email</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          resetMethod === 'link' 
                            ? 'border-primary bg-primary' 
                            : 'border-gray-300'
                        }`}>
                          {resetMethod === 'link' && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        resetMethod === 'otp' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setResetMethod('otp')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          resetMethod === 'otp' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">OTP Verification</h4>
                          <p className="text-sm text-gray-600">Enter a secure code sent to your email</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          resetMethod === 'otp' 
                            ? 'border-primary bg-primary' 
                            : 'border-gray-300'
                        }`}>
                          {resetMethod === 'otp' && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isAuthenticating || !resetMethod || (resetMethod === 'otp' && isTimerActive)}
                    size="lg"
                  >
                    {isAuthenticating ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : resetMethod === 'otp' && isTimerActive ? (
                      <span>Resend in {formatTime(timeLeft)}</span>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>
                          {resetMethod === 'link' ? 'Send reset link' : 
                           resetMethod === 'otp' ? 'Send OTP' : 'Choose method above'}
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
