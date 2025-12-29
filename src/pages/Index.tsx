import * as React from "react";
import { usePOS } from "@/hooks/use-pos-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ImageOff, Tag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { formatRupiah } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReceiptDialog from "@/components/ReceiptDialog";
import { Transaction } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const TAX_RATE = 0.11;
const MINIMUM_STOCK_THRESHOLD = 5;

const CategoryFilter: React.FC<{ selectedId: string | null, onSelect: (id: string | null) => void }> = ({ selectedId, onSelect }) => {
  const { categories } = usePOS();
  const { t } = useLanguage();

  return (
    <ScrollArea className="w-full whitespace-nowrap mb-6">
      <div className="flex w-max space-x-2 p-1">
        <Button
          variant={selectedId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(null)}
          className="rounded-full"
        >
          {t("allCategories")}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedId === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(cat.id)}
            className="rounded-full"
          >
            {cat.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

const ProductGrid: React.FC<{ selectedCategoryId: string | null }> = ({ selectedCategoryId }) => {
  const { products, addProductToCart } = usePOS();
  const { t } = useLanguage();

  const filteredProducts = React.useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter(p => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-lg flex flex-col group",
            product.stock === 0 && "opacity-50 cursor-not-allowed",
            product.stock > 0 && product.stock < MINIMUM_STOCK_THRESHOLD && "border-yellow-500 ring-2 ring-yellow-500/50"
          )}
          onClick={() => product.stock > 0 && addProductToCart(product.id)}
        >
          <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden rounded-t-lg relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
              />
            ) : (
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            )}
            {product.stock > 0 && product.stock < MINIMUM_STOCK_THRESHOLD && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    STOK TIPIS
                </div>
            )}
          </div>
          <CardHeader className="p-3 flex-grow space-y-0">
            <CardTitle className="text-sm truncate">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-lg font-bold text-primary">
              {formatRupiah(product.price)}
            </p>
            <p className={cn(
                "text-[10px]", 
                product.stock === 0 ? "text-destructive font-bold" : 
                product.stock < MINIMUM_STOCK_THRESHOLD ? "text-yellow-600 font-semibold" : 
                "text-muted-foreground"
            )}>
              {t("stockQuantity")}: {product.stock}
            </p>
          </CardContent>
        </Card>
      ))}
      {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
              Tidak ada produk dalam kategori ini.
          </div>
      )}
    </div>
  );
};

const BarcodeInput: React.FC = () => {
  const { addProductToCart } = usePOS();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = React.useState('');

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) {
      e.preventDefault();
      addProductToCart(barcode.trim());
      setBarcode('');
    }
  };

  return (
    <Input
      ref={inputRef}
      placeholder="Scan Barcode atau masukkan ID produk..."
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      onKeyDown={handleScan}
      className="mb-4"
    />
  );
};

const Cart: React.FC<{ onCheckoutSuccess: (tx: Transaction) => void }> = ({ onCheckoutSuccess }) => {
  const { cart, updateCartItemQuantity, removeProductFromCart, checkout, taxIncluded, setTaxIncluded } = usePOS();
  const { t } = useLanguage();
  
  const [tenderedAmount, setTenderedAmount] = React.useState<number>(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let tax = 0;
  let total = subtotal;

  if (!taxIncluded) {
    tax = subtotal * TAX_RATE;
    total = subtotal + tax;
  }
  
  const finalTotal = Math.round(total);
  const change = Math.round(tenderedAmount) - finalTotal;
  const isPaymentSufficient = change >= 0;

  React.useEffect(() => {
    if (cart.length > 0 && tenderedAmount === 0) {
        setTenderedAmount(finalTotal);
    }
  }, [cart.length, finalTotal]);


  const handleQuantityChange = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        updateCartItemQuantity(id, item.quantity + delta);
    }
  };
  
  const handleCheckout = () => {
    const transaction = checkout(tenderedAmount);
    if (transaction) {
        onCheckoutSuccess(transaction);
        setTenderedAmount(0);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("currentOrder")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground space-y-2">
              <ShoppingCart className="h-10 w-10 opacity-20" />
              <p className="text-sm px-4">{t("emptyCart")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      updateCartItemQuantity(item.id, parseInt(val) || 0);
                    }}
                    className="w-10 h-7 text-center p-0 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 ml-1"
                    onClick={() => removeProductFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center justify-between mb-3">
            <Label htmlFor="tax-toggle" className="text-xs">{t("taxIncludedToggle")}</Label>
            <Switch
                id="tax-toggle"
                checked={taxIncluded}
                onCheckedChange={setTaxIncluded}
            />
        </div>
        
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("subtotal")}</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("tax")} ({TAX_RATE * 100}%)</span>
            <span>{formatRupiah(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-1">
            <span>{t("total")}</span>
            <span>{formatRupiah(finalTotal)}</span>
          </div>
        </div>
        
        <div className="space-y-1.5 mb-3">
            <Label htmlFor="tendered-amount" className="text-xs">{t("tenderedAmount")}</Label>
            <Input
                id="tendered-amount"
                type="text"
                placeholder={formatRupiah(finalTotal).replace('Rp', '')}
                value={tenderedAmount || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setTenderedAmount(parseInt(val) || 0);
                }}
                className="text-lg font-semibold h-9"
            />
        </div>
        
        <div className={cn(
            "flex justify-between text-lg font-bold pt-2 border-t",
            change < 0 ? "text-destructive" : "text-primary"
        )}>
            <span className="text-sm font-medium">{t("change")}</span>
            <span>{formatRupiah(change)}</span>
        </div>

        <Button 
          className="w-full mt-4" 
          size="lg" 
          onClick={handleCheckout}
          disabled={cart.length === 0 || !isPaymentSufficient}
        >
          {t("processPayment")}
        </Button>
      </div>
    </Card>
  );
};


const Index = () => {
  const { t } = useLanguage();
  const [lastTransaction, setLastTransaction] = React.useState<Transaction | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  const handleCheckoutSuccess = (tx: Transaction) => {
    setLastTransaction(tx);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold hidden lg:block">{t("productSelection")}</h2>
          </div>
          
          <BarcodeInput />
          
          <CategoryFilter selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />

          <div className="flex-1 overflow-y-auto pr-2">
              <ProductGrid selectedCategoryId={selectedCategoryId} />
          </div>
        </div>
        
        <div className="lg:col-span-1 h-full min-h-0">
          <Cart onCheckoutSuccess={handleCheckoutSuccess} />
        </div>
      </div>
      
      <ReceiptDialog 
        transaction={lastTransaction} 
        onClose={() => setLastTransaction(null)} 
      />
    </>
  );
};

export default Index;