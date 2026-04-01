import type { Sale, Expense, Udhaar, Stock, Contact, StaffActivity } from '../context/ShopContext';

export interface ShopMetrics {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  receivable: number;
  payable: number;
  lowStockCount: number;
  inventoryValue: number;
  topItems: { name: string; count: number }[];
  recentActivity: number;
}

export const getPeriodData = (data: any[], days: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter(item => new Date(item.date) >= cutoff);
};

export const calculateMetrics = (
  sales: Sale[],
  expenses: Expense[],
  udhaars: Udhaar[],
  stock: Stock[],
  contacts: Contact[],
  activities: StaffActivity[]
): ShopMetrics => {
  const today = new Date().toISOString().split('T')[0];
  
  const totalSales = sales.filter(s => s.date.startsWith(today)).reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.filter(e => e.date.startsWith(today)).reduce((sum, e) => sum + e.amount, 0);
  
  // Profit Calculation: Sales - Expenses - Cost of Goods Sold (approx)
  // COGS for today's sales
  const todaySales = sales.filter(s => s.date.startsWith(today));
  let totalCogs = 0;
  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      const stockItem = stock.find(s => s.id === item.itemId);
      if (stockItem) {
        totalCogs += (stockItem.buyingPrice || 0) * item.qty;
      }
    });
  });

  const netProfit = totalSales - totalExpenses - totalCogs;

  // Udhaar
  const customerBalances: Record<string, number> = {};
  udhaars.forEach(u => {
    customerBalances[u.customerName] = (customerBalances[u.customerName] || 0) + u.amount;
  });

  let receivable = 0;
  let payable = 0;
  Object.entries(customerBalances).forEach(([name, bal]) => {
    const contact = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (contact?.type === 'customer' && bal > 0) receivable += bal;
    else if (contact?.type === 'supplier' && bal < 0) payable += Math.abs(bal);
  });

  // Stock
  const lowStockCount = stock.filter(s => s.quantity <= (s.minThreshold || 5)).length;
  const inventoryValue = stock.reduce((sum, s) => sum + (s.buyingPrice || 0) * s.quantity, 0);

  // Top Items
  const itemCounts: Record<string, number> = {};
  sales.forEach(s => s.items.forEach(i => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
  }));
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalSales,
    totalExpenses,
    netProfit,
    receivable,
    payable,
    lowStockCount,
    inventoryValue,
    topItems,
    recentActivity: activities.length
  };
};

export const getSpecificStats = (_query: string, data: any) => {
  const { sales, expenses, udhaars, stock } = data;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  // Today
  const todayS = sales.filter((x: any) => x.date.startsWith(today)).reduce((a: any, b: any) => a + b.total, 0);
  const todayE = expenses.filter((x: any) => x.date.startsWith(today)).reduce((a: any, b: any) => a + b.amount, 0);
  
  // Yesterday
  const yesterdayS = sales.filter((x: any) => x.date.startsWith(yesterday)).reduce((a: any, b: any) => a + b.total, 0);
  const yesterdayE = expenses.filter((x: any) => x.date.startsWith(yesterday)).reduce((a: any, b: any) => a + b.amount, 0);
  
  // Weekly (Last 7 Days)
  const weeklyS = sales.filter((x: any) => new Date(x.date) >= last7Days).reduce((a: any, b: any) => a + b.total, 0);
  const weeklyE = expenses.filter((x: any) => new Date(x.date) >= last7Days).reduce((a: any, b: any) => a + b.amount, 0);

  // General Status
  const totalReceivable = udhaars.reduce((a: any, b: any) => a + b.amount, 0);
  const lowStock = stock.filter((s: any) => s.quantity <= (s.minThreshold || 5)).length;
  const topItem = stock.sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))[0]?.name || 'N/A';

  return `
    PERIOD SUMMARY:
    - TODAY: Sales Rs. ${todayS}, Expenses Rs. ${todayE}, Net Rs. ${todayS - todayE}
    - YESTERDAY: Sales Rs. ${yesterdayS}, Expenses Rs. ${yesterdayE}, Net Rs. ${yesterdayS - yesterdayE}
    - LAST 7 DAYS: Total Sales Rs. ${weeklyS}, Total Expenses Rs. ${weeklyE}, Net Rs. ${weeklyS - weeklyE}
    
    OVERALL STATUS:
    - Total Udhaar (Receivable): Rs. ${totalReceivable}
    - Low Stock Count: ${lowStock}
    - Top Performing Item: ${topItem}
    - Inventory Value: Rs. ${stock.reduce((s: any, b: any) => s + (b.buyingPrice*b.quantity || 0), 0)}
    - Active Categories: ${new Set(stock.map((s: any) => s.category)).size}
  `;
};
