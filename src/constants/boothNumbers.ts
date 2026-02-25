// Static booth numbers from 001 to 188
export const BOOTH_NUMBERS = Array.from({ length: 188 }, (_, i) => 
  String(i + 1).padStart(3, '0')
);

// Helper function to validate booth number
export const isValidBoothNumber = (boothNumber: string): boolean => {
  return BOOTH_NUMBERS.includes(boothNumber);
};

// Helper function to format booth number (adds leading zeros)
export const formatBoothNumber = (num: string): string => {
  const numValue = parseInt(num, 10);
  if (isNaN(numValue) || numValue < 1 || numValue > 188) {
    return num;
  }
  return String(numValue).padStart(3, '0');
};
