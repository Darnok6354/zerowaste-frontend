export const getDaysUntilExpiration = (expirationDateString?: string | null): number | null => {
  if (!expirationDateString) return null;

  const expDate = new Date(expirationDateString);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDaysLeft = (daysLeft: number | null): string => {
  if (daysLeft === null) return "No expiration date";
  if (daysLeft === 0) return "0 days";
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
  if (daysLeft === 1) return "1 day";
  
  return `${daysLeft} days`;
};