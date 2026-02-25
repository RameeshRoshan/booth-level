import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { generateExcelCSV, downloadCSV, HouseholdRecord } from "../services/dataExport";
import { BOOTH_NUMBERS } from "../constants/boothNumbers";

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
      filtered = filtered.filter(r => r.boothNumberField === householdBoothFilter);
    }
    setRecords(filtered);
    setSubmissionCount(filtered.length);
  }, [allRecords, agentBoothFilter, householdBoothFilter]);

  if (loading) return <div>റിപ്പോർട്ട് ലോഡുചെയ്യുന്നു...</div>;
  const handleExport = () => {
    const excelCSV = generateExcelCSV(records);
    downloadCSV(excelCSV, "household_data_admin.csv");
  };

  return (
    <div className="text-[#1f4386]">
      <h2>Admin Report</h2>
      <div className="flex flex-row justify-between mb-6">
        <div className="  flex flex-col">
          <label>Agent Booth Number: </label>
          <select value={agentBoothFilter} onChange={e => setAgentBoothFilter(e.target.value)} className="w-16 text-[#1f4386]">
            <option value="all" >All</option>
            {BOOTH_NUMBERS.map(booth => (
              <option key={booth} value={booth} >{booth}</option>
            ))}
          </select>
        </div>
        <div  className="  flex flex-col">
          <label>Household Booth Number: </label>
          <select value={householdBoothFilter} onChange={e => setHouseholdBoothFilter(e.target.value)} className="w-16 text-[#1f4386]">
            <option value="all">All</option>
            {BOOTH_NUMBERS.map(booth => (
              <option key={booth} value={booth}>{booth}</option>
            ))}
          </select>
        </div>
      </div>
      <h2>Total Submissions: <strong>{submissionCount}</strong></h2>
      <button
        className="mt-4 px-12 w-1/2 pb-2 pt-4 bg-[#1f4386] text-white border-none rounded-md cursor-pointer font-semibold shadow-[2px_4px_10px_rgba(31,67,134,0.4)]"
        onClick={handleExport}
        disabled={records.length === 0}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default AdminDashboard;
