import React, { useState } from 'react';
import { sendPasswordResetEmail } from '../../lib/firebaseClient'; // Import your custom password reset function
import toast from 'sonner';

const PasswordResetForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(email); // Call your API or Firebase function here
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send password reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-form">
      <h2>Reset Your Password</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Password Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetForm;
