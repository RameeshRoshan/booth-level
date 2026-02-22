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

// Constants
const FORM_LABELS = {
  householdName: "പരിവാര അംഗത്തിന്റെ പേര്",
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

  // Fetch today's submission count
  const fetchTodayCount = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, "households"),
        where("boothNumber", "==", boothNumber),
        where("userId", "==", user.uid),
        where("createdAt", ">=", Timestamp.fromDate(today))
      );

      const snapshot = await getDocs(q);
      setSubmissionCount(snapshot.size);
    } catch (err) {
      console.error("Error fetching submission count:", err);
    }
  }, [user.uid, boothNumber]);

  useEffect(() => {
    fetchTodayCount();
  }, [fetchTodayCount]);

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
    // boothNumberField is now optional
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
          submittedAt: new Date().toISOString(), // explicit timestamp
        };

        const docRef = await addDoc(collection(db, "households"), householdEntry);

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

        // Update count
        await fetchTodayCount();

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
    [validateForm, formData, boothNumber, user.uid, user.displayName, user.phoneNumber, fetchTodayCount]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>പരിവാര വിവരങ്ങൾ</h2>
        {/* <p style={styles.subtitle}>Household Data Entry</p> */}
        <div style={styles.stats}>
          <p>ബൂത്ത്: <strong>{boothNumber}</strong></p>
          <p>ഇന്നത്തെ എൻട്രികൾ: <strong>{submissionCount}</strong></p>
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
          style={{
            ...styles.button,
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
  container: {
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    padding: "0",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    boxSizing: "border-box" as const
  } as React.CSSProperties,
  header: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "16px",
    borderRadius: 0,
    marginBottom: "24px",
    textAlign: "center" as const
  } as React.CSSProperties,
  title: {
    margin: "0 0 4px 0",
    fontSize: "18px"
  } as React.CSSProperties,
  subtitle: {
    margin: "0 0 12px 0",
    fontSize: "12px",
    opacity: 0.9
  } as React.CSSProperties,
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "8px",
    fontSize: "12px",
    flexWrap: "wrap" as const
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
  button: {
    width: "100%",
    padding: "13px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "8px"
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
