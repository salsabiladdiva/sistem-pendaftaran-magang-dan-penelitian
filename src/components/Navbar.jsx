import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Programs', path: '/programs' },
    { label: 'My Registrations', path: '/registrations' },
    { label: 'Details Join', path: '/details' },
  ];

  // Admin menu items
  const adminItems = [
    { label: 'Manage Programs', path: '/admin/programs' },
    { label: 'All Registrations', path: '/admin/registrations' },
    { label: 'Supervisors', path: '/admin/supervisors' },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                M
              </span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              MagangHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {user?.user_metadata?.role === 'admin' && (
              <div className="border-l border-white border-opacity-30 ml-3 pl-3">
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-yellow-200 hover:bg-yellow-200 hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-white text-sm">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-gray-200 text-xs">
                {user?.user_metadata?.role === 'admin' ? '👨‍💼 Admin' : '🎓 Student'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-indigo-800 bg-opacity-95 pb-4 space-y-2 animate-slideDown">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
            
            {user?.user_metadata?.role === 'admin' && (
              <>
                <div className="border-t border-white border-opacity-30 my-2"></div>
                <p className="text-yellow-200 font-bold px-4 py-2">Admin Panel</p>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block text-yellow-200 hover:bg-yellow-200 hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
            
            <div className="border-t border-white border-opacity-30 my-2"></div>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-all font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}