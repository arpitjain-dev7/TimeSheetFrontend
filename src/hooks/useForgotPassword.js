import { useState, useCallback } from "react";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/api";

/**
 * Custom hook that owns all forgot-password wizard state and API calls.
 * Components stay clean — they only call the exposed functions.
 *
 * Steps:  1 → Request OTP   2 → Verify OTP   3 → Reset Password   4 → Success
 */
const useForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(""); // never exposed to UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendKey, setResendKey] = useState(0); // increments to reset OTP timer

  const clearError = useCallback(() => setError(""), []);

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const requestOtp = useCallback(async (emailVal) => {
    setLoading(true);
    setError("");
    try {
      await forgotPassword({ email: emailVal });
      setEmail(emailVal);
      setOtpExpired(false);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Step 2: Resend OTP (stays on step 2, resets timer) ───────────────────
  const resendOtp = useCallback(async () => {
    setLoading(true);
    setError("");
    setOtpExpired(false);
    try {
      await forgotPassword({ email });
      setResendKey((k) => k + 1); // triggers timer reset in StepVerifyOtp
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  // ── Step 2: Verify OTP → get resetToken ──────────────────────────────────
  const verifyOtpFn = useCallback(
    async (otp) => {
      setLoading(true);
      setError("");
      setOtpExpired(false);
      try {
        const res = await verifyOtp({ email, otp });
        const token = res.data?.resetToken || res.data?.token;
        setResetToken(token);
        setStep(3);
      } catch (err) {
        if (err.response?.status === 410) {
          setOtpExpired(true);
          setError(
            err.response?.data?.message ||
              "OTP has expired. Please request a new one."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Invalid OTP. Please check and try again."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const resetPasswordFn = useCallback(
    async (newPassword, confirmPassword) => {
      setLoading(true);
      setError("");
      try {
        await resetPassword({ resetToken, newPassword, confirmPassword });
        setStep(4);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [resetToken]
  );

  // ── Reset entire wizard ───────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep(1);
    setEmail("");
    setResetToken("");
    setError("");
    setOtpExpired(false);
    setResendKey(0);
  }, []);

  return {
    step,
    email,
    loading,
    error,
    otpExpired,
    resendKey,
    clearError,
    requestOtp,
    verifyOtp: verifyOtpFn,
    resendOtp,
    resetPassword: resetPasswordFn,
    reset,
  };
};

export default useForgotPassword;
