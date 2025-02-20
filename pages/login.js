import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase'; // Import Firebase initialization
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import { toast, Toaster } from 'sonner'; // Import toast and Toaster from sonner
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const [invalidCredentials, setInvalidCredentials] = useState(false); 
  const { query } = useRouter();
  const { status } = query;
  useEffect(() => {
    if (status === 'emailVerified') {
      toast.success('Email verified successfully!');
    } else if (status === 'passwordReset') {
      toast.success('Password reset successfully!');
    }
  }, [status]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setInvalidCredentials(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        try {
          const response = await fetch('https://auth.ashe.tn/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });

          if (!response.ok) throw new Error('Failed to send verification email');
          
          setVerificationSent(true);
          toast.error('Verify your email before logging in. Check your inbox.');
        } catch (error) {
          toast.error('Failed to send verification email');
        }
        setLoading(false);
        return;
      }

      setUser(user);
      router.push('/');
    } catch (err) {
      setLoading(false);
      handleAuthError(err);
    }
  };

  const handleAuthError = (err) => {
    const errorMap = {
      'auth/invalid-credential': 'Invalid email or password',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Account temporarily locked - try again later',
      'auth/user-disabled': 'Account disabled - contact support'
    };

    toast.error(errorMap[err.code] || 'Login failed. Please try again.');
    
    if (['auth/invalid-credential', 'auth/wrong-password'].includes(err.code)) {
      setInvalidCredentials(true);
      setPassword('');
    }
  };
  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Enter your email to reset password');
      return;
    }

    try {
      const response = await fetch('https://auth.ashe.tn/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Password reset failed');

      setPasswordResetEmailSent(true);
      toast.success('Password reset email sent - check your inbox');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch('https://auth.ashe.tn/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email})
      });

      if (!response.ok) throw new Error('Verification email failed');
      
      toast.success('Verification email resent');
      setVerificationSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification');
    }
  };
 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router, setUser]);

  return (
    <div>
      <Head>
        <title>Login - ASHE</title>
        <meta name="description" content="Secure login to ASHE platform" />
      </Head>
      <Toaster position="bottom-center" richColors />

      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto bg-white -lg shadow-lg overflow-hidden">
          {/* Image section */}
          <div className="md:hidden">
            <Image
              src="/image_h.avif"
              alt="Login"
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image for larger screens */}
            <div className="hidden md:block">
              <Image
                src="/image_h.avif"
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

              <form onSubmit={handleLogin} enctype="multipart/form-data">
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
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white  focus:bg-white focus:text-black focus:outline-none"
                  disabled={loading}
                >
                  {loading ? <div className="loading"></div> : 'Join'}
                </button>
              </form>

              {invalidCredentials  && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handlePasswordReset}
                    className={`text-black hover:underline ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!email || passwordResetEmailSent}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {verificationSent  && (
                <div className="mt-4 text-center">
                  <button
                    onClick={resendVerification}
                    className="text-black hover:underline"
                  >
                    Didn't receive verification?{' '}
                  </button>
                </div>
              )}

              <div className="text-center mt-4">
                <p className="text-sm">
                New to ASHE?{' '}
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