import * as React from "react";
import { Product, CartItem, Transaction, Category } from "@/types";
import { toast } from "sonner";
import { useLanguage } from "./use-language";
import { formatRupiah } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const TAX_RATE = 0.11;

interface POSState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  transactions: Transaction[];
  taxIncluded: boolean;
  storeName: string;
  storeLogo: string | null;
  storeAddress: string;
  storePhone: string;
  receiptNotes: string;
  loading: boolean;
}

interface POSActions {
  addProductToCart: (productId: string, quantity?: number) => void;
  removeProductFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  checkout: (tenderedAmount: number) => Promise<Transaction | null>;
  updateProduct: (product: Product) => Promise<void>;
  createProduct: (id: string, name: string, price: number, purchasePrice: number, stock: number, categoryId?: string, imageUrl?: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setTaxIncluded: (included: boolean) => void;
  updateStoreIdentity: (name: string, logo: string | null, address: string, phone: string, notes: string) => Promise<void>;
}

const POSContext = React.createContext<(POSState & POSActions) | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<POSState>({
    products: [],
    categories: [],
    cart: [],
    transactions: [],
    taxIncluded: false,
    storeName: "Dyad POS",
    storeLogo: null,
    storeAddress: "",
    storePhone: "",
    receiptNotes: "Terima kasih atas pembelian Anda!",
    loading: true,
  });
  
  const { t } = useLanguage();

  // Update document title when store name changes
  React.useEffect(() => {
    document.title = state.storeName;
  }, [state.storeName]);

  const fetchData = React.useCallback(async () => {
    try {
      const [prodRes, catRes, transRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*').order('timestamp', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle()
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;
      if (transRes.error) throw transRes.error;

      const settings = settingsRes.data;

      setState(prev => ({
        ...prev,
        products: prodRes.data.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            purchasePrice: Number(p.purchase_price),
            stock: p.stock,
            imageUrl: p.image_url,
            categoryId: p.category_id
        })),
        categories: catRes.data,
        transactions: transRes.data.map(tx => ({
            ...tx,
            timestamp: new Date(tx.timestamp).getTime(),
        })),
        storeName: settings?.store_name || prev.storeName,
        storeLogo: settings?.store_logo || prev.storeLogo,
        storeAddress: settings?.store_address || prev.storeAddress,
        storePhone: settings?.store_phone || prev.storePhone,
        receiptNotes: settings?.receipt_notes || prev.receiptNotes,
        loading: false
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  React.useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const productsSub = supabase.channel('products-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .subscribe();

    const categoriesSub = supabase.channel('categories-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .subscribe();

    const transactionsSub = supabase.channel('transactions-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .subscribe();
    
    const settingsSub = supabase.channel('settings-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData())
      .subscribe();

    return () => {
      productsSub.unsubscribe();
      categoriesSub.unsubscribe();
      transactionsSub.unsubscribe();
      settingsSub.unsubscribe();
    };
  }, [fetchData]);

  const addProductToCart = (productId: string, quantity: number = 1) => {
    setState(prevState => {
      const product = prevState.products.find(p => p.id === productId);
      if (!product) return prevState;
      const existingCartItem = prevState.cart.find(item => item.id === productId);
      
      if (existingCartItem) {
        const newQuantity = existingCartItem.quantity + quantity;
        if (newQuantity > product.stock) {
            toast.error(t("toastStockLimit", { stock: product.stock, productName: product.name }));
            return prevState;
        }
        return {
          ...prevState,
          cart: prevState.cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item),
        };
      } else {
        if (quantity > product.stock) {
            toast.error(t("toastStockLimit", { stock: product.stock, productName: product.name }));
            return prevState;
        }
        return {
          ...prevState,
          cart: [...prevState.cart, { ...product, quantity }],
        };
      }
    });
    toast.success(t("toastItemAdded"));
  };

  const checkout = async (tenderedAmount: number): Promise<Transaction | null> => {
    if (state.cart.length === 0) {
      toast.error(t("toastCartEmpty"));
      return null;
    }
    
    let subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = state.taxIncluded ? subtotal : subtotal + (subtotal * TAX_RATE);
    const finalTotal = Math.round(total);
    const finalTendered = Math.round(tenderedAmount);
    const change = finalTendered - finalTotal;

    if (change < 0) {
        toast.error(t("insufficientFunds", { tendered: formatRupiah(finalTendered), total: formatRupiah(finalTotal) }));
        return null;
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([{
        total: finalTotal,
        tendered_amount: finalTendered,
        change: change,
        items: state.cart,
      }])
      .select()
      .single();

    if (txError) {
      toast.error("Gagal memproses transaksi");
      return null;
    }

    const stockUpdates = state.cart.map(item => {
        const product = state.products.find(p => p.id === item.id);
        return supabase.from('products').update({ stock: (product?.stock || 0) - item.quantity }).eq('id', item.id);
    });
    await Promise.all(stockUpdates);

    setState(prev => ({ ...prev, cart: [] }));
    toast.success(t("toastCheckoutSuccess", { total: formatRupiah(finalTotal) }));
    
    return {
        ...transaction,
        timestamp: new Date(transaction.timestamp).getTime()
    };
  };

  const createProduct = async (id: string, name: string, price: number, purchasePrice: number, stock: number, categoryId?: string, imageUrl?: string) => {
    const { error } = await supabase.from('products').insert([{
      id, name, price, purchase_price: purchasePrice, stock, category_id: categoryId, image_url: imageUrl
    }]);
    if (error) toast.error("Gagal membuat produk");
    else toast.success(t("toastProductCreated", { productName: name }));
  };

  const updateProduct = async (product: Product) => {
    const { error } = await supabase.from('products').update({
      name: product.name,
      price: product.price,
      purchase_price: product.purchasePrice,
      stock: product.stock,
      category_id: product.categoryId,
      image_url: product.imageUrl
    }).eq('id', product.id);
    if (error) toast.error("Gagal memperbarui produk");
    else toast.success(t("toastProductUpdated", { productName: product.name }));
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) toast.error("Gagal menghapus produk");
    else toast.warning("Produk dihapus");
  };

  const createCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (error) toast.error("Gagal membuat kategori");
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (error) toast.error("Gagal memperbarui kategori");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error("Gagal menghapus kategori");
  };

  const updateStoreIdentity = async (name: string, logo: string | null, address: string, phone: string, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          store_name: name,
          store_logo: logo,
          store_address: address,
          store_phone: phone,
          receipt_notes: notes,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Local state will be updated via real-time subscription
      toast.success(t("toastStoreUpdated"));
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  const value = { 
    ...state, 
    addProductToCart, 
    removeProductFromCart: (id: string) => setState(p => ({ ...p, cart: p.cart.filter(i => i.id !== id) })),
    updateCartItemQuantity: (id: string, q: number) => setState(p => ({ ...p, cart: p.cart.map(i => i.id === id ? { ...i, quantity: q } : i) })),
    checkout, 
    updateProduct, 
    createProduct, 
    deleteProduct, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    setTaxIncluded: (taxIncluded: boolean) => setState(p => ({ ...p, taxIncluded })),
    updateStoreIdentity 
  };
  
  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = React.useContext(POSContext);
  if (context === undefined) throw new Error("usePOS must be used within a POSProvider");
  return context;
};