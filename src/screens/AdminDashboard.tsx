import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { generateExcelCSV, downloadCSV, HouseholdRecord } from "../services/dataExport";

const AdminDashboard: React.FC = () => {
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<HouseholdRecord[]>([]);
  const [allRecords, setAllRecords] = useState<HouseholdRecord[]>([]);
  const [agentBoothFilter, setAgentBoothFilter] = useState<string>("all");
  const [householdBoothFilter, setHouseholdBoothFilter] = useState<string>("all");

  useEffect(() => {
    const fetchSubmissions = async () => {
      const snapshot = await getDocs(collection(db, "households"));
      // Map snapshot docs to HouseholdRecord[]
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt || data.created_at || null,
          householdName: data.householdName || data.household_name || "",
          phoneNumber: data.phoneNumber || data.household_phone || "",
          issues: data.issues || data.concerns || "",
          boothNumber: data.boothNumber || data.booth_number || "",
          boothNumberField: data.boothNumberField || "",
          userId: data.userId || data.user_id || "",
          userName: data.userName || data.user_name || "",
          userPhone: data.userPhone || data.user_phone || ""
        };
      });
      setAllRecords(docs);
      setLoading(false);
    };
    fetchSubmissions();
  }, []);

  // Filter records based on booth filters
  useEffect(() => {
    let filtered = allRecords;
    if (agentBoothFilter !== "all") {
      filtered = filtered.filter(r => r.boothNumber === agentBoothFilter);
    }
    if (householdBoothFilter !== "all") {
      filtered = filtered.filter(r => r.boothNumber === householdBoothFilter);
    }
    setRecords(filtered);
    setSubmissionCount(filtered.length);
  }, [allRecords, agentBoothFilter, householdBoothFilter]);

  // Get unique booth numbers for filters
  const agentBoothNumbers = Array.from(new Set(allRecords.map(r => r.boothNumber))).filter(Boolean);
  // Use boothNumberField for household booth filter
  const householdBoothNumbers = Array.from(new Set(allRecords.map(r => r.boothNumberField))).filter(Boolean);

  if (loading) return <div>റിപ്പോർട്ട് ലോഡുചെയ്യുന്നു...</div>;
  const handleExport = () => {
    const excelCSV = generateExcelCSV(records);
    downloadCSV(excelCSV, "household_data_admin.csv");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Report</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div>
          <label>Agent Booth Number: </label>
          <select value={agentBoothFilter} onChange={e => setAgentBoothFilter(e.target.value)}>
            <option value="all">All</option>
            {agentBoothNumbers.map(booth => (
              <option key={booth} value={booth}>{booth}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Household Booth Number: </label>
          <select value={householdBoothFilter} onChange={e => setHouseholdBoothFilter(e.target.value)}>
            <option value="all">All</option>
            {householdBoothNumbers.map(booth => (
              <option key={booth} value={booth}>{booth}</option>
            ))}
          </select>
          <small style={{ color: '#888', marginLeft: 8 }}>Uses boothNumberField</small>
        </div>
      </div>
      <p>Total Submissions: <strong>{submissionCount}</strong></p>
      <button
        style={{ marginTop: 16, padding: "8px 16px", background: "#2e7d32", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        onClick={handleExport}
        disabled={records.length === 0}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default AdminDashboard;
