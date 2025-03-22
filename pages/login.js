import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false); // Loading state for resend
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds
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

  // Cooldown timer effect to count down resendCooldown every second
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [resendCooldown]);

  // Refactored function to send the verification email
  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return false;
    }
    try {
      setResending(true);
      const response = await fetch('https://auth.ashe.tn/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }
      toast.success('Verification email sent. Please check your inbox.');
      // Set a 30-second cooldown to prevent multiple requests
      setResendCooldown(30);
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.message || 'Failed to resend verification email');
      return false;
    } finally {
      setResending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setInvalidCredentials(false);
    setVerificationNeeded(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      // If the email is not verified, trigger verification email logic
      if (!loggedInUser.emailVerified) {
        setVerificationNeeded(true);

        toast.error('Please verify your email before logging in.');
        
        setLoading(false);
        return;
      }

      setUser(loggedInUser);
      router.push('/');
    } catch (err) {
      setLoading(false);
      handleAuthError(err);
    }
  };

  const handleAuthError = (err) => {
    console.error('Auth error:', err.code, err.message);
    
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
      toast.success('Password reset email sent.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  // Triggered when user clicks on "Resend verification"
  const resendVerification = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before trying again.`);
      return;
    }
    await sendVerificationEmail();
  };

  // Auto-redirect if the user is authenticated and verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.emailVerified) {
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
        <div className="w-full max-w-2xl mx-auto bg-white  shadow-lg overflow-hidden">
          {/* Image section */}
          <div className="md:hidden">
            <Image
              src="/image_h.avif"
              alt="Login"
              width={500}
              height={500}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image for larger screens */}
            <div className="hidden md:block">
              <Image
                src="/image_h.avif"
                alt="Login"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Login form */}
            <div className="p-8 relative">
            <button
  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
  onClick={() => {
    // Check if there's a logged-in user with unverified email
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      // Log them out first
      auth.signOut()
        .then(() => {
          // Then redirect to home page
          router.push('/');
        })
        .catch(error => {

          router.push('/login');
        });
    } else {
      // If no user or email is verified, just redirect
      router.push('/');
    }
  }}
  aria-label="Close"
>
  &times;
</button>

              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

              <form onSubmit={handleLogin} encType="application/x-www-form-urlencoded">
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
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white focus:bg-white focus:text-black focus:outline-none"
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
                    disabled={!email || passwordResetEmailSent}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {verificationNeeded && (
                <div className="mt-4 text-center">
                  <p className="text-black text-sm">Didn't receive verification email?</p>
                    <button
                      onClick={resendVerification}
                      className={`font-semibold text-black text-sm hover:underline inline-block ${!email || resending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!email || resending}
                    >
                      {resending ? 'Resending...' : "Resend"}
                      {resendCooldown > 0 && ` (${resendCooldown}s)`}
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
