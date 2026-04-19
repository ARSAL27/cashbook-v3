
export const getLocalDateString = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  
  // Format as YYYY-MM-DD in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const isToday = (isoDate: string) => {
  if (!isoDate) return false;
  return getLocalDateString(isoDate) === getLocalDateString();
};

export const isThisWeek = (isoDate: string) => {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
};

export const isThisMonth = (isoDate: string) => {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};
