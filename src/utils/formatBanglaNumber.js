const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBanglaNum = (num) => {
  if (num === null || num === undefined) return "০";
  return num
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    .replace(/\d/g, (d) => bnDigits[d]);
};

export const formatTaka = (amount) => `৳${toBanglaNum(Math.round(amount))}`;