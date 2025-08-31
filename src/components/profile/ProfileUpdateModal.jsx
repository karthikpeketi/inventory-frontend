import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Check, X, Loader2, Edit } from 'lucide-react';
import { useToast, toastUtils } from '../ui/use-toast';
import authService from '../../api/authService';
import { validateName, normalizeEmail } from '../../utils/validation';
import useOtpTimer from '../../hooks/useOtpTimer'; // Import the custom hook

const ProfileUpdateModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'taken', 'checking', 'error'
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState(null); // 'valid', 'invalid', 'verifying'
  const [emailUpdateMode, setEmailUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false); // For OTP verification (new email)
  const [sendOldEmailOtpLoading, setSendOldEmailOtpLoading] = useState(false); // For sending old email OTP
  const [sendNewEmailOtpLoading, setSendNewEmailOtpLoading] = useState(false); // For sending new email OTP
  const [oldEmailOtpSent, setOldEmailOtpSent] = useState(false);
  const [oldEmailOtp, setOldEmailOtp] = useState('');
  const [oldEmailOtpStatus, setOldEmailOtpStatus] = useState(null);
  const [oldEmailVerified, setOldEmailVerified] = useState(false);
  const [newEmailInputEnabled, setNewEmailInputEnabled] = useState(false);
  const [newEmailError, setNewEmailError] = useState('');
  const [newEmailVerifiedAndDisabled, setNewEmailVerifiedAndDisabled] = useState(false); // New state to disable new email section

  // Initialize timers for old and new email OTPs
  const { timeLeft: oldEmailTimeLeft, isTimerActive: isOldEmailTimerActive, startTimer: startOldEmailTimer, resetTimer: resetOldEmailTimer, formatTime } = useOtpTimer('oldEmailOtpCooldownEnd');
  const { timeLeft: newEmailTimeLeft, isTimerActive: isNewEmailTimerActive, startTimer: startNewEmailTimer, resetTimer: resetNewEmailTimer } = useOtpTimer('newEmailOtpCooldownEnd');


  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
      });
      // Reset all email-related states when modal opens
      setNewEmail('');
      setEmailUpdateMode(false);
      setOtpSent(false);
      setOtp('');
      setOtpStatus(null);
      setOldEmailOtpSent(false);
      setOldEmailOtp('');
      setOldEmailOtpStatus(null);
      setOldEmailVerified(false);
      setNewEmailInputEnabled(false);
      setNewEmailError('');
      setNewEmailVerifiedAndDisabled(false); // Reset new email verified state
      // Reset timers when modal opens or user changes
      resetOldEmailTimer();
      resetNewEmailTimer();
    }
  }, [user, isOpen, resetOldEmailTimer, resetNewEmailTimer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username !== user?.username) {
        setUsernameStatus('checking');
        authService.checkUsername(formData.username)
          .then(available => {
            setUsernameStatus(available ? 'available' : 'taken');
          })
          .catch(() => setUsernameStatus('error'));
      } else {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, user?.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    // Only allow letters, spaces, hyphens, and apostrophes for name fields
    if (name === 'firstName' || name === 'lastName') {
      const filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewEmailChange = (e) => {
    // Normalize email input
    const email = normalizeEmail(e.target.value);
    setNewEmail(email);
    
    // Validate email and set error
    if (email && !isValidEmail(email)) {
      setNewEmailError('Please enter a valid email address');
    } else if (email === normalizeEmail(user?.email)) {
      setNewEmailError('New email cannot be the same as current email');
    } else {
      setNewEmailError('');
    }
    
    // Reset OTP states when new email changes
    setOtpSent(false);
    setOtp('');
    setOtpStatus(null);
    resetNewEmailTimer(); // Reset new email timer if email changes
  };

  const handleUpdateEmailClick = () => {
    setEmailUpdateMode(true);
  };

  const handleSendOldEmailOtp = async () => {
    if (!emailUpdateMode || sendOldEmailOtpLoading || isOldEmailTimerActive) return; // Disable if timer active
    setSendOldEmailOtpLoading(true);
    try {
      await authService.sendCurrentEmailOtp();
      setOldEmailOtpSent(true);
      startOldEmailTimer(); // Start old email timer
      toastUtils.patterns.auth.otpSent(toast, 'Check your current email for the OTP.');
    } catch (error) {
      toastUtils.patterns.auth.otpSendFailed(toast, error.message || 'Failed to send OTP.');
    } finally {
      setSendOldEmailOtpLoading(false);
    }
  };

  const handleVerifyOldEmailOtp = async () => {
    if (oldEmailOtp.length !== 6 || otpLoading) return;
    setOldEmailOtpStatus('verifying');
    setOtpLoading(true);
    try {
      const valid = await authService.verifyCurrentEmailOtp(user.email, oldEmailOtp);
      setOldEmailOtpStatus(valid ? 'valid' : 'invalid');
      if (valid) {
        setOldEmailVerified(true);
        setNewEmailInputEnabled(true);
        toastUtils.patterns.auth.otpVerified(toast, 'Current email verified successfully. You can now enter your new email.');
        resetOldEmailTimer(); // Clear old email timer on successful verification
      } else {
        toastUtils.patterns.auth.otpInvalid(toast);
      }
    } catch (error) {
      setOldEmailOtpStatus('invalid');
      toastUtils.patterns.auth.otpVerifyFailed(toast);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!newEmail || !oldEmailVerified || sendNewEmailOtpLoading || isNewEmailTimerActive) return; // Disable if timer active
    setSendNewEmailOtpLoading(true);
    try {
      await authService.sendOtp(newEmail);
      setOtpSent(true);
      startNewEmailTimer(); // Start new email timer
      toastUtils.patterns.auth.otpSent(toast, 'Check your new email for the OTP.');
    } catch (error) {
      toastUtils.patterns.auth.otpSendFailed(toast, error.message || 'Failed to send OTP.');
    } finally {
      setSendNewEmailOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || otpLoading) return;
    setOtpStatus('verifying');
    setOtpLoading(true);
    try {
      const valid = await authService.verifyOtp(newEmail, otp);
      setOtpStatus(valid ? 'valid' : 'invalid');
      if (valid) {
        toastUtils.patterns.auth.otpVerified(toast, 'New email verified successfully.');
        setNewEmailVerifiedAndDisabled(true); // Disable the new email section
        resetNewEmailTimer(); // Clear new email timer on successful verification
      } else {
        toastUtils.patterns.auth.otpInvalid(toast);
      }
    } catch (error) {
      setOtpStatus('invalid');
      toastUtils.patterns.auth.otpVerifyFailed(toast);
    } finally {
      setOtpLoading(false);
    }
  };

  const isUsernameValid = usernameStatus === null || usernameStatus === 'available';
  const isEmailValid = !emailUpdateMode || (oldEmailVerified && otpSent && otpStatus === 'valid');
  const areNamesValid = validateName(formData.firstName).isValid && validateName(formData.lastName).isValid;
  const isFormValid = isUsernameValid && isEmailValid && areNamesValid && formData.firstName && formData.lastName;

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    try {
      const dataToUpdate = {};
      if (formData.firstName !== user.firstName) dataToUpdate.firstName = formData.firstName;
      if (formData.lastName !== user.lastName) dataToUpdate.lastName = formData.lastName;
      if (formData.username !== user.username) dataToUpdate.username = formData.username;
      if (emailUpdateMode && isEmailValid && newEmail) dataToUpdate.email = newEmail;

      if (Object.keys(dataToUpdate).length === 0) {
        toastUtils.info(toast, 'No Changes', 'No updates to save.');
        onClose();
        return;
      }

      await updateUser(dataToUpdate);
      onClose();
    } catch (error) {
      // Error handled in updateUser
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh]"> {/* Added overflow-y-auto and max-h */}
          {/* First Name and Last Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleNameChange} 
                  className="w-full" 
                />
              </div>
              {formData.firstName && !validateName(formData.firstName).isValid && (
                <p className="text-red-500 text-sm">{validateName(formData.firstName).error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleNameChange} 
                  className="w-full" 
                />
              </div>
              {formData.lastName && !validateName(formData.lastName).isValid && (
                <p className="text-red-500 text-sm">{validateName(formData.lastName).error}</p>
              )}
            </div>
          </div>

          {/* Username and Role Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input 
                  id="username" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="w-full" 
                />
                {usernameStatus === 'checking' && (
                  <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
                {usernameStatus === 'available' && (
                  <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {usernameStatus === 'taken' && (
                  <X className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {usernameStatus === 'taken' && (
                <p className="text-red-500 text-sm">Username already taken</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-green-500 text-sm">Username available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                name="role" 
                value={formData.role} 
                readOnly
                className="w-full bg-gray-50" 
              />
            </div>
          </div>

          {/* Email Field - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative flex items-center">
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                readOnly
                className="w-full pr-20" 
              />
              {!emailUpdateMode && (
                <Button
                  onClick={handleUpdateEmailClick}
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Email Update Flow */}
          {emailUpdateMode && (
            <div className="space-y-4">
              {/* Step 1: Verify Current Email */}
              {!oldEmailVerified && (
                <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">Step 1: Verify Current Email</h4>
                    <Button 
                      onClick={handleSendOldEmailOtp} 
                      disabled={sendOldEmailOtpLoading || isOldEmailTimerActive}
                      variant="outline"
                      size="sm"
                    >
                      {sendOldEmailOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isOldEmailTimerActive ? `Resend in ${formatTime(oldEmailTimeLeft)}` : 'Send OTP'} {/* Display timer */}
                    </Button>
                  </div>
                  <p className="text-sm text-blue-700">
                    We need to verify your current email ({user?.email}) before updating to the new one.
                  </p>
                  
                  {oldEmailOtpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="oldEmailOtp">OTP from Current Email</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="oldEmailOtp"
                            value={oldEmailOtp}
                            onChange={(e) => setOldEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full"
                            maxLength={6}
                          />
                          {oldEmailOtpStatus === 'verifying' && (
                            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                          )}
                          {oldEmailOtpStatus === 'valid' && (
                            <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <Button 
                          onClick={handleVerifyOldEmailOtp} 
                          disabled={oldEmailOtp.length !== 6 || otpLoading || oldEmailOtpStatus === 'verifying'}
                          className="px-6"
                        >
                          {otpLoading || oldEmailOtpStatus === 'verifying' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Verify
                        </Button>
                      </div>
                      {oldEmailOtpStatus === 'invalid' && (
                        <p className="text-red-500 text-sm">Invalid OTP. Please try again.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Enter New Email */}
              {newEmailInputEnabled && !newEmailVerifiedAndDisabled && (
                <div className="space-y-3 p-4 border rounded-lg bg-green-50">
                  <h4 className="font-medium text-green-900">Step 2: Enter New Email</h4>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <div className="space-y-2">
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={handleNewEmailChange}
                          placeholder="Enter your new email address"
                          className="w-full"
                          disabled={otpSent || newEmailVerifiedAndDisabled || sendNewEmailOtpLoading}
                        />
                      {newEmailError && (
                        <p className="text-red-500 text-sm">{newEmailError}</p>
                      )}
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSendOtp} 
                          disabled={!newEmail || newEmailError || sendNewEmailOtpLoading || isNewEmailTimerActive || newEmailVerifiedAndDisabled}
                          variant="outline"
                          size="sm"
                          className="px-6"
                        >
                          {sendNewEmailOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isNewEmailTimerActive ? `Resend in ${formatTime(newEmailTimeLeft)}` : 'Send OTP'} {/* Display timer */}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Verify New Email OTP */}
              {otpSent && !newEmailVerifiedAndDisabled && (
                <div className="space-y-3 p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-medium text-yellow-900">Step 3: Verify New Email</h4>
                  <p className="text-sm text-yellow-700">
                    Check your new email ({newEmail}) for the OTP.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP from New Email</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          className="w-full"
                          maxLength={6}
                          disabled={newEmailVerifiedAndDisabled}
                        />
                        {otpStatus === 'verifying' && (
                          <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                        {otpStatus === 'valid' && (
                          <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <Button 
                        onClick={handleVerifyOtp} 
                        disabled={otp.length !== 6 || otpLoading || otpStatus === 'verifying' || newEmailVerifiedAndDisabled}
                        className="px-6"
                      >
                        {otpLoading || otpStatus === 'verifying' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify
                      </Button>
                    </div>
                    {otpStatus === 'invalid' && (
                      <p className="text-red-500 text-sm">Invalid OTP. Please try again.</p>
                    )}
                  </div>
                </div>
              )}
              {newEmailVerifiedAndDisabled && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-100 text-gray-600">
                  <h4 className="font-medium text-gray-900">New Email Verified</h4>
                  <p className="text-sm">
                    Your new email ({newEmail}) has been successfully verified.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
            className="w-full group sm:w-auto"
            size="lg"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;
