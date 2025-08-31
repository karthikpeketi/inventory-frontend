import { useState } from 'react';
import { User, Menu, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { HEADER_HEIGHT } from '../../constants/layout';
import ProfileUpdateModal from '../profile/ProfileUpdateModal';
import ChangePasswordModal from '../profile/ChangePasswordModal';
import EnhancedSearchInterface from '../ui/EnhancedSearchInterface';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  return (
    <>
      <header 
        className={`flex items-center justify-between ${HEADER_HEIGHT} px-3 md:px-8 border-b border-white/20 bg-white/80 backdrop-blur-sm relative z-20 shadow-soft`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden mr-3 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Enhanced Search Section */}
        <EnhancedSearchInterface className="flex-1 max-w-2xl" />

        {/* Right Section */}
        <div 
          className="flex items-center space-x-3 ml-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
              >
                <Button variant="ghost" className="rounded-2xl p-2 hover:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-800">{`${user?.firstName.toUpperCase() || ''} ${user?.lastName.toUpperCase() || ''}` || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl border-gray-200 bg-white/95 backdrop-blur-sm shadow-soft-lg">
              <DropdownMenuLabel className="font-display text-gray-900">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-xl m-1 hover:bg-gray-100" onClick={() => setShowProfileModal(true)}>
                <User className="mr-3 h-4 w-4 text-gray-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-xl m-1 hover:bg-gray-100" onClick={() => setShowChangePasswordModal(true)}>
                <Lock className="mr-3 h-4 w-4 text-gray-500" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-xl m-1 hover:bg-red-50 text-red-600" onClick={logout}>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ProfileUpdateModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
    </>
  );
}

export default Header;
