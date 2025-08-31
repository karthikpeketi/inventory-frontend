import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, toastUtils } from '../components/ui/use-toast';
import { authService } from '../api';
import { STORAGE_KEYS } from '../constants/auth';
import { clearAllSessionData, validateAndSanitizeSession } from '../utils/sessionSecurity';

// Create context
const AuthContext = createContext();

// Create provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  // SECURITY FIX: Helper function to clear all session data
  const clearSessionData = () => {
    clearAllSessionData();
    setUser(null);
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      // SECURITY FIX: Use centralized session validation
      const validUserData = validateAndSanitizeSession();
      
      if (validUserData) {
        setUser(validUserData);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function using the API
  const login = async (usernameOrEmail, password) => {
    setIsAuthenticating(true);

    try {
      // SECURITY FIX: Clear any existing session data before new login
      // This prevents session mixing between different users
      clearSessionData();

      // Call the login API
      const response = await authService.login(usernameOrEmail, password);
      
      // Store token and user data for the new user
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      setUser(response);

      toastUtils.patterns.auth.loginSuccess(toast);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      // SECURITY FIX: Ensure cleanup on login failure
      clearSessionData();
      
      const errorMessage = error?.details || error?.message || "Invalid credentials";
      toastUtils.patterns.auth.loginFailed(toast, errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Register function using the API
  const register = async (firstName, lastName, email, password) => {
    setIsAuthenticating(true);

    try {
      // Call the register API
      const {message} = await authService.register(firstName, lastName, email, password);
      
      toastUtils.patterns.auth.registerSuccess(toast, message);

      navigate('/login');
    } catch (error) {
      // Extract error message from backend response
      const errorMessage = error?.message || error?.details || "Something went wrong";
      toastUtils.patterns.auth.registerFailed(toast, errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsAuthenticating(true);
    try {
      await authService.logout();
      clearSessionData();
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      // SECURITY FIX: Clear session data even if logout API fails
      clearSessionData();
      navigate('/login');
      toast({
        title: "Logout failed",
        description: error.message || error.response?.data?.message || "Something went wrong during logout",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsAuthenticating(true);

    try {
      await authService.forgotPassword(email);

      toastUtils.patterns.auth.passwordResetSent(toast);
      return {message: true};
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toastUtils.patterns.auth.passwordResetFailed(toast, errorMessage);
      return {message: false, error: errorMessage};
    } finally {
      setIsAuthenticating(false);
    }
  };

    // Forgot password with otp
  const forgotPasswordOtp = async (email) => {
    setIsAuthenticating(true);

    try {
      await authService.forgotPasswordOtp(email);

      toastUtils.patterns.auth.otpSent(toast);
      return {message: true};
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toastUtils.patterns.auth.otpSendFailed(toast, errorMessage);
      return {message: false, error: errorMessage};
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Mock reset password
  const resetPassword = async (token, password) => {
    setIsAuthenticating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const updated = await authService.updateProfile(updatedData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      setUser(updated);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      return updated;
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isInitialLoading: isLoading,
        isAuthenticating,
        login,
        register,
        logout,
        forgotPassword,
        forgotPasswordOtp,
        resetPassword,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
