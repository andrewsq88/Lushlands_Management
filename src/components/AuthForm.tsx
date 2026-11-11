import React, { useState } from 'react';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LOGO_PATH } from '../seo/site';

/** /signup opens in sign-up mode; /auth, /login and every other path open in sign-in mode. */
function initialSignUpMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (window.location.pathname.replace(/\/+$/, '') || '/') === '/signup';
}

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(initialSignUpMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Set after a sign-up that needs email confirmation (no session returned).
  // Holds the address exactly as typed so it can be shown back; never logged.
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Form submission:', isSignUp ? 'Sign Up' : 'Sign In');
      
      const { data, error } = isSignUp 
        ? await signUp(email, password, firstName, lastName)
        : await signIn(email, password);

      if (error) {
        console.error('Authentication error:', error);
        setError(error.message || 'An authentication error occurred');
      } else {
        console.log('Authentication successful');
        // A sign-up that returns a user but no session is waiting on email
        // confirmation: replace the form with a "check your email" message.
        if (isSignUp && data?.user && !data?.session) {
          setConfirmationEmail(email);
        }
        // Clear form on success
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err) {
      console.error('Unexpected authentication error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const backToSignIn = () => {
    setConfirmationEmail(null);
    setIsSignUp(false);
    setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: 'url("/abstract-fluid-art-background-blue-cyan-turquoise-white-colors-mix-together-beautiful-creative-print-hand-paint-original-200291924.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center font-playfair">
          <div className="flex justify-center">
            <img 
              src={LOGO_PATH} 
              alt="LushLands Management Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {confirmationEmail ? 'Confirm your email' : isSignUp ? 'Create your account' : 'Sign in to'}
          </h2>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">
              LushLands Management
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-900">
            {confirmationEmail
              ? 'One more step to activate your account'
              : isSignUp ? 'Start managing your properties today' : 'Welcome back to your property dashboard'}
          </p>
        </div>

        {confirmationEmail ? (
          <div className="mt-8 bg-white p-8 rounded-xl shadow-lg text-center" role="status" aria-live="polite">
            <div className="flex justify-center">
              <MailCheck className="h-10 w-10 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Check your email to confirm your account</h3>
            <p className="mt-2 text-sm text-gray-700">
              We sent a confirmation link to{' '}
              <span className="font-medium text-gray-900 break-all">{confirmationEmail}</span>.
              Open it to activate your account, then sign in.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Can't find it? Check your spam or junk folder.
            </p>
            <button
              type="button"
              onClick={backToSignIn}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-900 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-900 hover:text-gray-700 font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
