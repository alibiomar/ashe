import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../lib/firebase'; // Import Firebase initialization
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import { toast, Toaster } from 'sonner'; // Import toast and Toaster from sonner

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for login
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState(false); // Track if reset email was sent
  const [invalidCredentials, setInvalidCredentials] = useState(false); // Show "Forgot password" option
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth(); // Access global login state

  // Extract query parameters (e.g., status=emailVerified or status=passwordReset)
  const { query } = useRouter();
  const { status } = query;

  useEffect(() => {
    // Display success messages based on the query parameter
    if (status === 'emailVerified') {
      toast.success('Your email has been verified successfully!');
    } else if (status === 'passwordReset') {
      toast.success('Your password has been reset successfully!');
    }
  }, [status]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setInvalidCredentials(false); // Reset the invalid credentials state
    setLoading(true); // Set loading state

    // Validate inputs
    if (!email || !password) {
      toast.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        setError(true);
        setLoading(false);
      } else {
        setUser(user);
        router.push('/'); // Redirect to home page
      }
    } catch (err) {
      setLoading(false); // Stop loading
      if (err.code === 'auth/invalid-credential') {
        toast.error('Invalid credentials. Please check your email and password.');
        setPassword(''); // Reset password only
        setInvalidCredentials(true); // Enable "Forgot password?" option
      } else if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please check your email or sign up.');
      } else if (err.code === 'auth/missing-email' || err.code === 'auth/invalid-email') {
        toast.error('Please provide a valid email address.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your email to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordResetEmailSent(true); // Update state to show feedback
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err) {
      toast.error('Failed to send password reset email. Please try again later.');
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent. Please check your inbox.');
      }
    } catch (err) {
      toast.error('Unable to resend verification email. Please try again later.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
        router.push('/'); // Redirect to home page if already logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router, setUser]);

  return (
    <div>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
      </Head>
      <Toaster position="bottom-center" />

      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto bg-white -lg shadow-lg overflow-hidden">
          {/* Image section */}
          <div className="md:hidden">
            <img
              src="/image_h.jpg"
              alt="Login"
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image for larger screens */}
            <div className="hidden md:block">
              <img
                src="/image_h.jpg"
                alt="Login"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Login form */}
            <div className="p-8 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
                onClick={() => router.push('/')}
                aria-label="Close"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border -md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full p-3 border -md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"
                  disabled={loading}
                >
                  {loading ? <div className="loading"></div> : 'Join'}
                </button>
              </form>

              {invalidCredentials && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handlePasswordReset}
                    className={`text-black hover:underline ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!email}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 text-center">
                  <button
                    onClick={resendVerificationEmail}
                    className="text-black hover:underline"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}

              <div className="text-center mt-4">
                <p className="text-sm">
                  Don't have an account?{' '}
                  <a
                    href="/signup"
                    className="w-full mt-4 py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/signup');
                    }}
                  >
                    Signup
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}