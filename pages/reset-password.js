import { useRouter } from "next/router";
import { useState } from "react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { app } from '../lib/firebase';

const ResetPassword = () => {
  const router = useRouter();
  const { oobCode } = router.query;
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      const auth = getAuth(app);
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleReset}>Reset Password</button>
      <p>{message}</p>
    </div>
  );
};

export default ResetPassword;
