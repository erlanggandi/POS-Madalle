import * as React from "react";
import { usePOS } from "@/hooks/use-pos-store";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/hooks/use-language";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { Receipt } from "lucide-react";

const OrderHistoryPage: React.FC = () => {
  const { transactions } = usePOS();
  const { t } = useLanguage();

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("orderHistory")}</h2>
      
      {sortedTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Receipt className="h-8 w-8 mx-auto mb-2" />
            <p>{t("noOrdersYet")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">{t("transactionId")}</TableHead>
                <TableHead className="w-[180px]">{t("date")}</TableHead>
                <TableHead>{t("itemsSold")}</TableHead>
                <TableHead className="text-right w-[150px]">{t("totalAmount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{format(tx.timestamp, 'dd MMM yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {tx.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{item.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatRupiah(tx.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;