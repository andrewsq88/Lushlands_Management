import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, User, Users, DollarSign, TrendingUp, PiggyBank, Wrench, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/properties', icon: Home, label: 'Properties' },
    { path: '/tenants', icon: Users, label: 'Owners/Tenants' },
    { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { path: '/payments', icon: DollarSign, label: 'Payments' },
    { path: '/financing', icon: TrendingUp, label: 'Financing' },
    { path: '/down-payment', icon: PiggyBank, label: 'Down Payment' },
    { path: '/subscription', icon: CreditCard, label: 'Subscription' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand Name */}
            <div className="flex items-center min-w-0">
              <img 
                src="/Possible Property Hub Logo.png" 
                alt="LushLands Management Logo" 
                className="h-10 w-10 object-contain flex-shrink-0"
              />
              <span className="ml-3 text-xl font-bold whitespace-nowrap" style={{ color: '#B8860B' }}>
                LushLands
              </span>
            </div>
            
            {/* Desktop Navigation - Compressed */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-1 py-1 rounded-md text-xs font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Link>
              ))}
            </div>

            {/* User Menu and Bolt Badge */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center text-xs text-gray-600">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate max-w-32">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-1 py-1 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-64 overflow-y-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </Link>
            ))}
          </div>
          
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}