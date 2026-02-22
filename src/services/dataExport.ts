// src/services/dataExport.ts
// Service for exporting household data to CSV/Excel format

export interface HouseholdRecord {
  id: string;
  createdAt: any;
  householdName: string;
  phoneNumber: string;
  issues: string;
  boothNumber: string;
  boothNumberField: string;
  userId: string;
  userName: string;
  userPhone: string;
}

/**
 * Convert household records to CSV format
 */
export const convertToCSV = (records: HouseholdRecord[]): string => {
  if (records.length === 0) {
    return "No records found";
  }

  // CSV Headers
  const headers = [
    "Date",
    "Time",
    "Booth Number",
    "User Name",
    "User Phone",
    "Household Name",
    "Household Phone",
    "Issues/Concerns",
    "Entry ID"
  ];

  // Convert records to CSV rows
  const rows = records.map(record => {
    const date = record.createdAt ? new Date(record.createdAt.seconds * 1000) : new Date();
    const dateStr = date.toLocaleDateString("en-IN");
    const timeStr = date.toLocaleTimeString("en-IN");
    
    return [
      dateStr,
      timeStr,
      `"${record.boothNumber}"`,
      `"${record.userName}"`,
      `"${record.userPhone}"`,
      `"${record.householdName}"`,
      `"${record.phoneNumber}"`,
      `"${record.issues.replace(/"/g, '""')}"`, // Escape quotes
      `"${record.id}"`
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

/**
 * Download CSV file
 */
export const downloadCSV = (csv: string, filename: string = "household_data.csv"): void => {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate Excel-compatible CSV with better formatting
 */
export const generateExcelCSV = (records: HouseholdRecord[]): string => {
  if (records.length === 0) {
    return "";
  }

  const headers = [
    "Date & Time",
    "Booth",
    "Household Booth",
    "User Name",
    "User Phone",
    "Household Name",
    "Household Phone",
    "Issues",
    "ID"
  ];

  const rows = records.map(record => {
    const date = record.createdAt ? new Date(record.createdAt.seconds * 1000) : new Date();
    const dateTimeStr = date.toLocaleString("en-IN");

    // Prefix phone numbers with a single quote to force Excel to treat as text
    const userPhone = record.userPhone ? `'${record.userPhone}` : "-";
    const householdPhone = record.phoneNumber ? `'${record.phoneNumber}` : "-";

    return [
      dateTimeStr,
      record.boothNumber,
      record.boothNumberField,
      record.userName,
      userPhone,
      record.householdName,
      householdPhone,
      record.issues.replace(/\n/g, " "), // Remove line breaks
      record.id.slice(0, 8)
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",");
  });

  return [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
};

/**
 * Format records for JSON export
 */
export const exportToJSON = (records: HouseholdRecord[]): string => {
  return JSON.stringify(records, null, 2);
};

/**
 * Download JSON file
 */
export const downloadJSON = (records: HouseholdRecord[], filename: string = "household_data.json"): void => {
  const json = exportToJSON(records);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate summary statistics
 */
export const generateSummary = (records: HouseholdRecord[]) => {
  const totalEntries = records.length;
  const uniqueBooths = new Set(records.map(r => r.boothNumber)).size;
  const uniqueUsers = new Set(records.map(r => r.userId)).size;
  const uniqueHouseholds = new Set(records.map(r => r.phoneNumber)).size;

  return {
    totalEntries,
    uniqueBooths,
    uniqueUsers,
    uniqueHouseholds,
    generatedAt: new Date().toLocaleString("en-IN")
  };
};
