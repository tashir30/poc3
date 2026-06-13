export interface DashboardSnapshot {
  productsCount: number;
  categoriesCount: number;
  staffCount: number;
  activityToday: number;
  lowStock: Array<{ id: string; name: string; stock_quantity: number }>;
  recentActivity: Array<{
    id: string;
    change_amount: number;
    action_type: string;
    timestamp: string;
    products: { name: string };
  }>;
}
