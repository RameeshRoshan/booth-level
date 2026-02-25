// src/screens/HouseholdForm.tsx

import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { isValidBoothNumber } from "../constants/boothNumbers";

// Constants
const FORM_LABELS = {
  householdName: "അംഗത്തിന്റെ പേര്",
  phoneNumber: "ഫോൺ നമ്പർ",
  issues: "പ്രശ്നങ്ങൾ",
  boothNumberField: "ബൂത്ത് നമ്പർ",
  areaRegion: "പ്രദേശം/മേഖല",
};

const VALIDATION_MESSAGES = {
  householdNameRequired: "അംഗത്തിന്റെ പേര് ആവശ്യമാണ്",
  phoneNumberRequired: "ഫോൺ നമ്പർ ആവശ്യമാണ്",
  phoneNumberMinLength: "ഫോൺ നമ്പർ കുറഞ്ഞത് 10 അക്കമെങ്കിലും വേണം",
  issuesRequired: "പ്രശ്നങ്ങൾ/ആശങ്കകൾ വിശദീകരിക്കുക",
  boothNumberFieldRequired: "ബൂത്ത് നമ്പർ ആവശ്യമാണ്",
  boothNumberFieldInvalid: "സാധുവായ ബൂത്ത് നമ്പർ നൽകുക (001-188)",
  areaRegionRequired: "പ്രദേശം/മേഖല ആവശ്യമാണ്",
};

const MESSAGE_CLEAR_TIMEOUT = 3000;

// Types
interface HouseholdFormProps {
  user: User;
  boothNumber: string;
}

interface HouseholdData {
  householdName: string;
  phoneNumber: string;
  issues: string;
  boothNumberField: string;
  areaRegion: string;
}

interface MessageState {
  type: "success" | "error";
  text: string;
}

const HouseholdForm: React.FC<HouseholdFormProps> = ({ user, boothNumber }) => {
  const [formData, setFormData] = useState<HouseholdData>({
    householdName: "",
    phoneNumber: "",
    issues: "",
    boothNumberField: "",
    areaRegion: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch today's submission count
  const fetchTodayCount = useCallback(async () => {
    try {
      // Get today's date at midnight in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const midnightTimestamp = Timestamp.fromDate(today);
      
      console.log("=== Today's Count Query ===");
      console.log("Midnight date (local):", today.toString());
      console.log("Midnight timestamp:", midnightTimestamp.toDate().toString());
      console.log("Midnight timestamp (seconds):", midnightTimestamp.seconds);

      // Query only by userId (no index required)
      const q = query(
        collection(db, "households"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      
      // Filter in JavaScript for today's entries
      let todayCount = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const docDate = data.createdAt.toDate();
          console.log("Document createdAt:", docDate.toString());
          
          // Compare if document is from today
          if (docDate >= today) {
            todayCount++;
          }
        }
      });
      
      console.log("Documents found for today:", todayCount);
      setSubmissionCount(todayCount);
    } catch (err) {
      console.error("Error fetching submission count:", err);
    }
  }, [user.uid]);

  // Fetch total submission count (all time)
  const fetchTotalCount = useCallback(async () => {
    try {
      const q = query(
        collection(db, "households"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      setTotalCount(snapshot.size);
    } catch (err) {
      console.error("Error fetching total count:", err);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchTodayCount();
    fetchTotalCount();
  }, [fetchTodayCount, fetchTotalCount]);

  // Handle form input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Validate form data
  const validateForm = useCallback((): string | null => {
    if (!formData.householdName.trim()) {
      return VALIDATION_MESSAGES.householdNameRequired;
    }
    if (!formData.phoneNumber.trim()) {
      return VALIDATION_MESSAGES.phoneNumberRequired;
    }
    if (formData.phoneNumber.length < 10) {
      return VALIDATION_MESSAGES.phoneNumberMinLength;
    }
    // Validate booth number if provided
    if (formData.boothNumberField.trim() && !isValidBoothNumber(formData.boothNumberField.trim())) {
      return VALIDATION_MESSAGES.boothNumberFieldInvalid;
    }
    if (!formData.areaRegion.trim()) {
      return VALIDATION_MESSAGES.areaRegionRequired;
    }
    if (!formData.issues.trim()) {
      return VALIDATION_MESSAGES.issuesRequired;
    }
    return null;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        setMessage({ type: "error", text: validationError });
        return;
      }

      setLoading(true);
      try {
        const householdEntry = {
          householdName: formData.householdName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          issues: formData.issues.trim(),
          boothNumber, // booth number of the account logged in
          boothNumberField: formData.boothNumberField.trim(),
          areaRegion: formData.areaRegion.trim(),
          userId: user.uid, // account submitting
          userName: user.displayName || "Unknown",
          userPhone: user.phoneNumber,
          createdAt: serverTimestamp(), // Use serverTimestamp for consistency
          submittedAt: new Date().toISOString(), // explicit timestamp
        };

        await addDoc(collection(db, "households"), householdEntry);

        setMessage({
          type: "success",
          text: "✓ എൻട്രി വിജയകരമായി സമർപ്പിച്ചു",
        });

        // Reset form
        setFormData({
          householdName: "",
          phoneNumber: "",
          issues: "",
          boothNumberField: "",
          areaRegion: "",
        });

        // Update count (wait a bit for server timestamp to be set)
        setTimeout(async () => {
          await fetchTodayCount();
          await fetchTotalCount();
        }, 500);

        // Clear success message after timeout
        setTimeout(() => setMessage(null), MESSAGE_CLEAR_TIMEOUT);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to submit entry";
        // Malayalam error message
        const malErrorMsg = errorMsg === "Failed to submit entry"
          ? "എൻട്രി സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല"
          : `പിശക്: ${errorMsg}`;
        setMessage({ type: "error", text: malErrorMsg });
        console.error("Submission error:", error);
      } finally {
        setLoading(false);
      }
    },
    [validateForm, formData, boothNumber, user.uid, user.displayName, user.phoneNumber, fetchTodayCount, fetchTotalCount]
  );

  return (
    <div className="w-full max-w-full rounded m-0 p-0 min-h-screen box-border">
      <div className="text-white p-4 rounded-none text-center bg-linear-to-br from-[#1F4386] to-[#0697C7] inset-shadow-sm inset-shadow-[#1F4386]">
        <h2 style={styles.title}>പരിവാര വിവരങ്ങൾ</h2>
        <div className="flex justify-around mt-2 text-xs flex-wrap gap-2">
          <p>ബൂത്ത്: <strong>{boothNumber}</strong></p>
          <p>ഇന്നത്തെ എൻട്രികൾ: <strong>{submissionCount}</strong></p>
          <p>ആകെ എൻട്രികൾ: <strong>{totalCount}</strong></p>
        </div>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
          color: message.type === "success" ? "#155724" : "#721c24",
          borderLeft: `4px solid ${message.type === "success" ? "#28a745" : "#dc3545"}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{FORM_LABELS.householdName}</label>
          <input
            type="text"
            name="householdName"
            value={formData.householdName}
            onChange={handleChange}
            placeholder="അംഗത്തിന്റെ പേര്"
            style={styles.input}
            maxLength={100}
            disabled={loading}
            lang="ml"
            inputMode="text"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>{FORM_LABELS.boothNumberField}</label>
          <input
            type="text"
            name="boothNumberField"
            value={formData.boothNumberField}
            onChange={handleChange}
            placeholder="ബൂത്ത് നമ്പർ"
            style={styles.input}
            maxLength={10}
            disabled={loading}
            lang="ml"
            inputMode="text"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>{FORM_LABELS.areaRegion}</label>
          <input
            type="text"
            name="areaRegion"
            value={formData.areaRegion}
            onChange={handleChange}
            placeholder="പ്രദേശം/മേഖല"
            style={styles.input}
            maxLength={50}
            disabled={loading}
            lang="ml"
            inputMode="text"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>{FORM_LABELS.phoneNumber}</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="ഫോൺ നമ്പർ"
            style={styles.input}
            maxLength={15}
            disabled={loading}
            lang="ml"
            inputMode="numeric"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>{FORM_LABELS.issues}</label>
          <textarea
            name="issues"
            value={formData.issues}
            onChange={handleChange}
            placeholder="പ്രശ്നങ്ങൾ / ആശങ്കകൾ"
            style={styles.textarea}
            rows={5}
            disabled={loading}
            lang="ml"
            inputMode="text"
          />
        </div>

        <button
          type="submit"
          className="w-full p-[13px] text-base font-semibold bg-linear-to-br from-[#1b5e20] to-[#4caf50] shadow-[2px_8px_6px_rgba(129,199,132,0.5)] text-white border-none rounded-md cursor-pointer mt-2"
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "സമർപ്പിക്കുന്നു..." : "സമർപ്പിക്കുക"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  title: {
    margin: "0 0 4px 0",
    fontSize: "18px"
  } as React.CSSProperties,
  subtitle: {
    margin: "0 0 12px 0",
    fontSize: "12px",
    opacity: 0.9
  } as React.CSSProperties,
  message: {
    padding: "12px 16px",
    borderRadius: "6px",
    margin: "16px",
    marginBottom: "16px",
    fontSize: "13px"
  } as React.CSSProperties,
  form: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "0px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    margin: "0"
  } as React.CSSProperties,
  formGroup: {
    marginBottom: "16px"
  } as React.CSSProperties,
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#333"
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "11px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit"
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "11px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    resize: "vertical" as const,
    minHeight: "80px"
  } as React.CSSProperties,
  footer: {
    textAlign: "center" as const,
    marginTop: "24px",
    marginBottom: "16px",
    color: "#666",
    fontSize: "12px"
  } as React.CSSProperties,
  hint: {
    margin: 0
  } as React.CSSProperties
};

export default HouseholdForm;
