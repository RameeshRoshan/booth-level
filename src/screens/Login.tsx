// src/screens/Login.tsx

import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult  
} from "firebase/auth";
import { auth } from "../firebase";
import appIcon from "../assets/app_icon.png";

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
          { 
            size: "normal", // Changed from invisible to normal for better mobile compatibility
            callback: () => {
              console.log("reCAPTCHA solved");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
            }
          }
        );
      } catch (err) {
        console.error("reCAPTCHA setup error:", err);
      }
    }
  };

  const sendOTP = async () => {
    setError("");
    
    if (!phone || phone.length < 10) {
      setError("സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക");
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
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      let errorMessage = "OTP അയയ്ക്കാൻ കഴിഞ്ഞില്ല";
      
      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-phone-number":
            errorMessage = "സാധുവല്ലാത്ത ഫോൺ നമ്പർ";
            break;
          case "auth/too-many-requests":
            errorMessage = "വളരെയധികം ശ്രമങ്ങൾ. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക";
            break;
          case "auth/network-request-failed":
            errorMessage = "നെറ്റ്‌വർക്ക് പിശക്. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
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
      setError("സാധുവായ 6 അക്ക OTP നൽകുക");
      return;
    }
    
    if (!confirmation) {
      setError("സ്ഥിരീകരണം കണ്ടെത്തിയില്ല. വീണ്ടും OTP അയയ്ക്കുക");
      return;
    }

    try {
      setLoading(true);
      await confirmation.confirm(otp);
    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      let errorMessage = "തെറ്റായ OTP";
      
      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-verification-code":
            errorMessage = "തെറ്റായ OTP. വീണ്ടും ശ്രമിക്കുക";
            break;
          case "auth/code-expired":
            errorMessage = "OTP കാലഹരണപ്പെട്ടു. പുതിയ OTP അഭ്യർത്ഥിക്കുക";
            break;
          case "auth/network-request-failed":
            errorMessage = "നെറ്റ്‌വർക്ക് പിശക്. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
    className="flex flex-col justify-start pt-10 items-center h-screen ">
      <img src={appIcon} alt="App Icon"/>
      <h2 className="text-black">ലോഗിൻ</h2>

      {error && (
        <div className="bg-[#ffcccc] text-[#cc0000] p-[15px] mb-5 rounded-[5px] text-[14px]">
          {error}
        </div>
      )}

      {!confirmation ? (
        <div className="w-screen p-4">
          <input
            type="tel"
            className="text-black mb-4"
            placeholder="മൊബൈൽ നമ്പർ"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            lang="ml"
            inputMode="numeric"
          />
          <button 
            onClick={sendOTP}  
            className="w-full p-6 bg-[#1f4386] text-white shadow-[2px_4px_10px_rgba(31,67,134,0.4)] text-lg"
            disabled={loading || !phone}>
            OTP അയയ്ക്കുക
          </button>
        </div>
      ) : (
        <div className="w-screen p-4">
          <input
            type="text"
            className="text-black mb-4"
            placeholder="OTP നൽകുക"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            disabled={loading}
            lang="ml"
            inputMode="numeric"
          />
          <button onClick={verifyOTP}
          className="w-full p-6 bg-[#1f4386] text-white"
           disabled={loading || !otp}>
            സ്ഥിരീകരിക്കുക
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
