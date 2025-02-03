import { useEffect, useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import { toast, Toaster } from "sonner"; // Using Sonner for notifications

export default function ResetPassword() {
  const router = useRouter();
  const { oobCode } = router.query; // Get oobCode from URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password has been reset successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
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
      </div>
    </div>
  );
}
