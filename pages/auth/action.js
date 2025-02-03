import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";
import { toast, Toaster } from "sonner";

export default function AuthActionPage() {
  const router = useRouter();
  const { mode, oobCode, lang } = router.query;
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Set Firebase language code
    if (lang) auth.languageCode = lang;

    // Security checks
    const isValidDomain = window.location.host === "test.ashe.tn";
    if (!isValidDomain) {
      toast.error("Unauthorized domain");
      router.push("/");
      return;
    }

    if (!mode || !oobCode) {
      toast.error("Invalid request.");
      router.push("/");
      return;
    }

    const verifyCode = async () => {
      try {
        if (mode === "resetPassword") {
          const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
          setEmail(verifiedEmail);
          setValidCode(true);
        } else if (mode === "verifyEmail") {
          const info = await checkActionCode(auth, oobCode);
          setEmail(info.data.email);
          setValidCode(true);
        }
      } catch (error) {
        handleAuthError(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [mode, oobCode, router, lang]);

  const handleAuthError = (error) => {
    switch (error.code) {
      case "auth/expired-action-code":
        toast.error("This link has expired. Please request a new one.");
        break;
      case "auth/invalid-action-code":
        toast.error("Invalid security code. Please check your link.");
        break;
      case "auth/user-disabled":
        toast.error("This account has been disabled.");
        break;
      default:
        toast.error("Authentication failed. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success(`Password reset for ${email}!`);
      router.push("/login");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await applyActionCode(auth, oobCode);
      toast.success(`${email} verified successfully!`);
      router.push("/login");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!validCode || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verifying security code...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster position="top-center" richColors />
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
        {mode === "resetPassword" ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4">
              Reset Password for {email}
            </h2>
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New Password (min 8 characters)"
                className="w-full p-2 border rounded mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="8"
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
                className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Securely Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : mode === "verifyEmail" ? (
          <>
            <h2 className="text-xl font-bold text-center mb-4">
              Verify {email}
            </h2>
            <button
              className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
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