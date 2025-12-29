import * as React from "react";
import { Transaction } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { usePOS } from "@/hooks/use-pos-store";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, ShoppingCart } from "lucide-react";

interface ReceiptDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TAX_RATE = 0.11;

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({ transaction, onClose }) => {
  const { t } = useLanguage();
  const { storeName, storeLogo, storeAddress, storePhone, receiptNotes } = usePOS();

  if (!transaction) return null;

  const subtotalBase = transaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedTax = transaction.total - subtotalBase;

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="h-12 w-12 object-contain" />
            ) : (
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">{storeName}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {storeAddress && <p>{storeAddress}</p>}
            {storePhone && <p>Telp: {storePhone}</p>}
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm mt-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("transactionId")}: {transaction.id}</span>
            <span>{format(transaction.timestamp, 'dd/MM/yyyy HH:mm')}</span>
          </div>
          
          <Separator />

          <div className="space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate max-w-[60%]">{item.name} ({item.quantity}x)</span>
                <span>{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{formatRupiah(subtotalBase)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("tax")} ({TAX_RATE * 100}%)</span>
              <span>{formatRupiah(calculatedTax)}</span>
            </div>
          </div>

          <Separator className="h-[2px] bg-primary" />

          <div className="flex justify-between text-xl font-bold">
            <span>{t("totalPaid")}</span>
            <span>{formatRupiah(transaction.total)}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>{t("tendered")}</span>
              <span>{formatRupiah(transaction.tenderedAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>{t("changeDue")}</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </div>

          {receiptNotes && (
            <>
              <Separator />
              <p className="text-center italic text-muted-foreground text-xs whitespace-pre-wrap">
                {receiptNotes}
              </p>
            </>
          )}
        </div>
        
        <Button onClick={() => window.print()} className="w-full mt-4">
            <Printer className="h-4 w-4 mr-2" /> {t("printReceipt")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;