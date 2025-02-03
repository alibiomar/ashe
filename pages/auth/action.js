import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
} from "firebase/auth";
import { toast, Toaster } from "sonner"; // Toast notifications

export default function AuthActionPage() {
  const router = useRouter();
  const { mode, oobCode } = router.query; // Get mode & oobCode from URL
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!mode || !oobCode) {
      toast.error("Invalid request.");
      router.push("/");
    }
  }, [mode, oobCode, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password reset successful!");
      router.push("/login");
    } catch (error) {
      toast.error("Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await applyActionCode(auth, oobCode);
      toast.success("Email verified successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Invalid or expired verification link.");
    }
  };

  if (!mode || !oobCode) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
        {mode === "resetPassword" ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4">Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2 border rounded mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border rounded mb-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-black text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : mode === "verifyEmail" ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4">Verify Email</h2>
            <button
              className="w-full bg-black text-white p-2 rounded"
              onClick={handleVerifyEmail}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Confirm Email"}
            </button>
          </>
        ) : (
          <h2 className="text-xl font-bold text-center">Invalid Request</h2>
        )}
      </div>
    </div>
  );
}
