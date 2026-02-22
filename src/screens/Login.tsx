// src/screens/Login.tsx

import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "../firebase";

const Login: React.FC = () => {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Cleanup reCAPTCHA verifier when component unmounts
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      } catch (err) {
        console.error("reCAPTCHA setup error:", err);
      }
    }
  };

  const sendOTP = async () => {
    setError("");
    
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    try {
      setLoading(true);
      const formattedPhone = "+91" + phone;
      
      setupRecaptcha();

      const appVerifier = (window as any).recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmation(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      setError(errorMessage);
      // Clear verifier on error for retry
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    if (!confirmation) {
      setError("Confirmation result not found. Please send OTP again.");
      return;
    }

    try {
      setLoading(true);
      await confirmation.confirm(otp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="flex flex-row justify-center items-center">
      <h2>ലോഗിൻ</h2>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!confirmation ? (
        <>
          <input
            type="tel"
            placeholder="മൊബൈൽ നമ്പർ"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            maxLength={10}
            disabled={loading}
            lang="ml"
            inputMode="numeric"
          />
          <button onClick={sendOTP} style={styles.button} disabled={loading || !phone}>
            OTP അയയ്ക്കുക
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="OTP നൽകുക"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
            maxLength={6}
            disabled={loading}
            lang="ml"
            inputMode="numeric"
          />
          <button onClick={verifyOTP} style={styles.button} disabled={loading || !otp}>
            സ്ഥിരീകരിക്കുക
          </button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    textAlign: "center",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  } as React.CSSProperties,
  error: {
    backgroundColor: "#ffcccc",
    color: "#cc0000",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 14
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    boxSizing: "border-box"
  } as React.CSSProperties,
  button: {
    width: "100%",
    padding: 15,
    fontSize: 18,
    backgroundColor: "green",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: 5
  } as React.CSSProperties
};

export default Login;
