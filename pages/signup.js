import { useState } from 'react';
import { Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Import Head from next/head
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast, Toaster } from 'sonner'; // Import toast and Toaster from sonner

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    setLoading(true); // Set loading to true

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      setLoading(false); // Set loading to false
      return;
    }

    // Simple email format validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      setLoading(false); // Set loading to false
      return;
    }
    if (!/^\d{8,15}$/.test(phone)) {
      toast.error('Phone number must be 8-15 digits');
      setLoading(false); // Set loading to false

      return;
    }
    try {
      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
      await setDoc(doc(db, 'baskets', user.uid), {
        items: []
      });
      // Send email verification
      await sendEmailVerification(user);
      toast.success('Signup successful! A verification email has been sent. Please check your inbox.');

      // Log the user out immediately after signup
      await signOut(auth);

      // Redirect to login page after signup
      router.push('/login');
    } catch (err) {
      // Handle Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already in use. Please use a different email.');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Please use a stronger password.');
          break;
        default:
          toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading to false after the process is complete
    }
  };

  return (
    <Suspense fallback={<div className='loader'></div>}>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign up for an account" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center ">
        <Toaster position="bottom-center" />

        <div className="w-full max-w-lg mx-auto bg-white -lg shadow-lg overflow-hidden">
          {/* Image section for mobile */}
          <div className="md:hidden">
            <img
              src="/image_h.jpg"
              alt="Signup"
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image section for larger screens */}
            <div className="hidden md:block">
              <img
                src="/image_h.jpg"
                alt="Signup"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Signup form */}
            <div className="p-8 relative">
              <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
                onClick={() => router.push('/')}
                aria-label="Close"
              >
                &times;
              </button>
              <form onSubmit={handleSignup} className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full p-2 border -md placeholder-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full p-2 border -md placeholder-sm"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-2 border -md placeholder-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border -md placeholder-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border -md placeholder-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-2 border -md placeholder-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none "
                  disabled={loading}
                >
                  {loading ? <div className="loading"></div> : 'Sign Up'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{' '}
                  <a
                    href="/login"
                    className="w-full  mt-4 py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none "
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/login');
                    }}
                  >
                    Log in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
