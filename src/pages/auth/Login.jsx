import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Package, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label';
import { normalizeEmail } from '../../utils/validation';
import { ensureCleanAuthState } from '../../utils/sessionSecurity';


const Login = () => {
  const [usernameOrEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticating } = useAuth(); // Get the login function and authentication state

  // SECURITY FIX: Clear any existing session data when login page loads
  useEffect(() => {
    ensureCleanAuthState();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(usernameOrEmail, password);
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
            Welcome back to your inventory management system
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Manage your products, track orders, and grow your business with our powerful platform.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="mx-auto w-full max-w-sm"
        >
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
              Sign in to your account
            </h2>
            <p className="text-gray-600 mb-8">
              Or{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                create a new account
              </Link>
            </p>
          </div>

          <div
            className="rounded-3xl bg-white p-8 shadow-soft-lg border border-gray-200"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="usernameOrEmail" className="text-sm font-medium text-gray-700">
                  Username or Email
                </Label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    required
                    disabled={isAuthenticating}
                    value={usernameOrEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10"
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link 
                    to="/forgot-password"
                    state={usernameOrEmail ? { 
                      email: usernameOrEmail.includes('@') ? normalizeEmail(usernameOrEmail) : usernameOrEmail 
                    } : undefined}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    disabled={isAuthenticating}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10"
                    placeholder="Enter your password"
                  />
                  <div
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isAuthenticating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isAuthenticating && setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full group"
                  disabled={isAuthenticating}
                  size="lg"
                >
                  {isAuthenticating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign in</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
