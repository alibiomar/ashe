import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebaseClient';
import AuthLayout from '../components/Auth/AuthLayout';

const VerifyEmailPage = () => {
  const router = useRouter();
  const { oobCode } = router.query;
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (!oobCode) return;

    const verifyEmail = async () => {
      try {
        await auth.applyActionCode(oobCode);
        setStatus('Email verified successfully! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } catch (error) {
        setStatus(`Verification failed: ${error.message}`);
      }
    };

    verifyEmail();
  }, [oobCode]);

  return (
    <AuthLayout>
      <div className="verification-status">
        <h1>Email Verification</h1>
        <p>{status}</p>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;