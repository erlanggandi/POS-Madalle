import * as React from "react";
import { usePOS } from "@/hooks/use-pos-store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, ImageOff, AlertTriangle, Tag } from "lucide-react";
import ProductForm from "@/components/ProductForm";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/use-language";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MINIMUM_STOCK_THRESHOLD = 5;

const StockPage = () => {
  const { products, deleteProduct, categories } = usePOS();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return t("noCategory");
    return categories.find(c => c.id === categoryId)?.name || t("noCategory");
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Habis</Badge>;
    if (stock < MINIMUM_STOCK_THRESHOLD) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-300">
          <AlertTriangle className="h-3 w-3 mr-1" /> Rendah
        </Badge>
      );
    }
    return <Badge variant="secondary">Cukup</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("inventoryList", { count: filteredProducts.length })}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t("addNewProduct")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? t("editProduct") : t("createNewProduct")}</DialogTitle>
            </DialogHeader>
            <ProductForm initialData={editingProduct} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
          <Input
            placeholder="Cari produk berdasarkan nama atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead className="w-[120px] text-right">{t("price")}</TableHead>
              <TableHead className="w-[120px] text-right">{t("purchasePrice")}</TableHead>
              <TableHead className="w-[100px] text-center">{t("stockQuantity")}</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[150px] text-center">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                    <div className="h-10 w-10 bg-muted flex items-center justify-center rounded overflow-hidden">
                        {product.imageUrl ? (
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                            />
                        ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {getCategoryName(product.categoryId)}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatRupiah(product.price)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatRupiah(product.purchasePrice)}</TableCell>
                <TableCell className="text-center">
                    <span className={cn(
                        "font-semibold",
                        product.stock < MINIMUM_STOCK_THRESHOLD && "text-destructive",
                        product.stock >= MINIMUM_STOCK_THRESHOLD && "text-muted-foreground"
                    )}>
                        {product.stock}
                    </span>
                </TableCell>
                <TableCell className="text-center">
                    {getStockStatus(product.stock)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("confirmDeleteDescription", { productName: product.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                            {t("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockPage;