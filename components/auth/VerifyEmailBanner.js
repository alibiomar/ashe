import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebaseClient';

const VerifyEmailBanner = () => {
  const router = useRouter();
  const { oobCode } = router.query;
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (!oobCode) return;

    const verifyEmail = async () => {
      try {
        await auth.applyActionCode(oobCode);
        setStatus('Email verified successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000); // Or redirect wherever needed
      } catch (error) {
        setStatus(`Verification failed: ${error.message}`);
      }
    };

    verifyEmail();
  }, [oobCode]);

  return (
    <div className="verification-status">
      <h1>Email Verification</h1>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmailBanner;
