import * as React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DollarSign, Package, Receipt, TrendingUp } from "lucide-react";
import { usePOS } from "@/hooks/use-pos-store";
import { formatRupiah } from "@/lib/utils";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data for chart visualization
const mockSalesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const SalesReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const { transactions } = usePOS();

  // Calculate key metrics
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalTransactions = transactions.length;
  const totalItemsSold = transactions.reduce((sum, tx) => sum + tx.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  // Calculate Net Profit: (Selling Price - Purchase Price) * Quantity for all items
  const totalProfit = transactions.reduce((sum, tx) => {
    const txProfit = tx.items.reduce((itemSum, item) => {
      return itemSum + ((item.price - item.purchasePrice) * item.quantity);
    }, 0);
    return sum + txProfit;
  }, 0);

  // Custom formatter for Recharts tooltip to display Rupiah
  const rupiahTooltipFormatter = (value: number) => [formatRupiah(value), t("sales")];
  
  // Custom formatter for YAxis to display Rupiah (only showing the Rp symbol and thousands separator)
  const rupiahAxisFormatter = (value: number) => formatRupiah(value).replace('Rp', '');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("salesReports")}</h2>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t("basedOnTransactions")}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">{t("totalProfit")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatRupiah(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">{t("profitDescription")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTransactions")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">{t("ordersProcessed")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalItemsSold")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">{t("unitsSold")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t("weeklySalesOverview")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={mockSalesData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={rupiahAxisFormatter} />
              <Tooltip formatter={rupiahTooltipFormatter} />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReportsPage;