import axiosClient from './axiosClient';

const authService = {
  /**
   * Login with usernameOrEmail and password
   * @param {string} usernameOrEmail - User usernameOrEmail
   * @param {string} password - User password
   * @returns {Promise} - Promise with login response
   */
  login: async (usernameOrEmail, password) => {
    try {
      const { data } = await axiosClient.post('/auth/login', { usernameOrEmail, password });

      // Safely handle role format
      const role = data?.role?.includes('_') ? data.role.split('_')[1] : data.role;

      return {
        ...data,
        role,
      };
    } catch (error) {
      // Handle and rethrow for UI/consumer to catch
      throw error?.response?.data || { message: 'Login failed' };
    }
  },


 /**
   * Register a new user
   * @param {string} firstName - User first name
   * @param {string} lastName - User last name
   * @param {string} username - User username
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} requiresApproval - Whether the account requires admin approval
   * @returns {Promise} - Promise with registration response
   */
  register: async (firstName, lastName, email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', { 
        firstName, 
        lastName, 
        username: email.split('@')[0].toLowerCase(),
        email,
        password
      });
      return response.data; 
    } catch (error) {
      throw error?.response?.data || { message: 'Registration failed' };
    }
  },

  /**
   * Initiate password reset process
   * @param {string} email - User email
   * @returns {Promise} - Promise with response
   */
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Initiate password reset process with OTP
   * @param {string} email - User email
   * @returns {Promise} - Promise with response
   */
  forgotPasswordOtp: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password-otp', { email });
    return response.data;
  },

  /**
   * Verify password reset OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise} - Promise with verification response
   */
  verifyPasswordResetOtp: async (email, otp) => {
    const response = await axiosClient.post('/auth/verify-password-reset-otp', { email, otp });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise with response
   */
  resetPassword: async (token, newPassword) => {
    const response = await axiosClient.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },

  /**
   * Reset password with OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise with response
   */
  resetPasswordWithOtp: async (email, otp, newPassword) => {
    const response = await axiosClient.post('/auth/reset-password-otp', { 
      email, 
      otp, 
      newPassword 
    });
    return response.data;
  },

  /**
   * Validate activation token
   * @param {string} token - Activation token
   * @returns {Promise} - Promise with validation response
   */
  validateActivationToken: async (token) => {
    const response = await axiosClient.get(`/users/verify-activation-token?token=${token}`);
    return response.data;
  },

  /**
   * Activate account with token and password
   * @param {string} token - Activation token
   * @param {string} password - New password
   * @returns {Promise} - Promise with activation response
   */
  activateAccount: async (token, password) => {
    const response = await axiosClient.post('/users/activate-account', { 
      token, 
      password 
    });
    return response.data;
  },


  
  /**
   * Logout the current user
   * @returns {Promise} - Promise with logout response
   */
  logout: async () => {
    try {
      const response = await axiosClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Logout failed' };
    }
  },

  checkUsername: async (username) => {
    try {
      const response = await axiosClient.get('/users/check-username', { params: { username } });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Check username failed' };
    }
  },

  sendCurrentEmailOtp: async () => {
    try {
      const response = await axiosClient.post('/users/send-current-email-otp');
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Send current email OTP failed' };
    }
  },

  verifyCurrentEmailOtp: async (email, otp) => {
    try {
      const response = await axiosClient.post('/users/verify-current-email-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Verify current email OTP failed' };
    }
  },

  sendOtp: async (newEmail) => {
    try {
      const response = await axiosClient.post('/users/send-otp', { newEmail });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Send OTP failed' };
    }
  },

  verifyOtp: async (newEmail, otp) => {
    try {
      const response = await axiosClient.post('/users/verify-otp', { newEmail, otp });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Verify OTP failed' };
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await axiosClient.put('/users/me', data);
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Update profile failed' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosClient.post('/users/change-password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Change password failed' };
    }
  }
};

export default authService;
