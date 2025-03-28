import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState(''); // Added gender state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!/^\d{8,15}$/.test(phone)) {
      toast.error('Phone number must be 8-15 digits.');
      setLoading(false);
      return;
    }

    if (!gender) { // Gender validation
      toast.error('Please select your gender.');
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    
      // Save user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
        gender, 
        createdAt: new Date().toISOString(),
        role: 'user',
      });
    
      // Add user to newsletter_signups collection
      await addDoc(collection(db, 'newsletter_signups'), {
        email,
        timestamp: serverTimestamp(),
      });
    
      // Create an empty basket for the user
      await setDoc(doc(db, 'baskets', user.uid), {
        items: [],
      });
    
      // Send verification email via backend
      const response = await fetch('https://auth.ashe.tn/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    
      if (!response.ok) throw new Error('Failed to send verification email');
    
      // Notify user and clear form
      toast.success('Account created! Please check your email to verify your account.');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGender(''); // Reset gender state
    
      // Log out the user immediately after signup
      await signOut(auth);
    
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      handleSignupError(err);
    } finally {
      setLoading(false);
    }
    
  };

  const handleSignupError = (err) => {
    const errorMap = {
      'auth/email-already-in-use': 'This email is already in use. Please use a different email.',
      'auth/weak-password': 'Password is too weak. Please use a stronger password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    toast.error(errorMap[err.code] || 'An unexpected error occurred. Please try again.');
  };

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign up for an account" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Toaster position="bottom-center" richColors />

        <div className="w-full max-w-3xl mx-auto  bg-white shadow-lg overflow-hidden">
          {/* Image section for mobile */}
          <div className="md:hidden">
            <Image
              src="/image_h.avif"
              alt="Signup"
              width={500}
              height={500}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image section for larger screens */}
            <div className="hidden md:block">
              <Image
                src="/image_h.avif"
                alt="Signup"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Signup form */}
            <div className="p-8 relative ">
              <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
              <button
  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
  onClick={() => {
    // Check if there's a logged-in user with unverified email
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      // Log them out first
      signOut(auth)
        .then(() => {
          // Then redirect to home page
          router.push('/');
        })
        .catch(error => {

          router.push('/signup');
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
              <form onSubmit={handleSignup} className="grid gap-4" encType="application/x-www-form-urlencoded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full p-2 border rounded-md placeholder-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full p-2 border rounded-md placeholder-sm"
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
                    className="w-full p-2 border rounded-md placeholder-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded-md placeholder-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded-md placeholder-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-2 border rounded-md placeholder-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Gender</div>
                  <div className="flex gap-3">
                    {["male", "female"].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={gender === option}
                          onChange={(e) => setGender(e.target.value)}
                          className="peer hidden"
                          required
                        />
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center
                          group-hover:border-gray transition-colors duration-200
                          peer-checked:border-black peer-checked:bg-black
                          peer-focus-visible:ring-4 peer-focus-visible:ring-gray">
                          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>


                <button
                  type="submit"
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white  focus:bg-white focus:text-black focus:outline-none"
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
                    className="w-full mt-4 py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-white text-black hover:bg-black hover:text-white focus:bg-white focus:text-black focus:outline-none"
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
    </>
  );
}