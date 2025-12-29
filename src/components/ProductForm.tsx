import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types";
import { usePOS } from "@/hooks/use-pos-store";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  price: z.number().min(1, "Price must be positive"), 
  purchasePrice: z.number().min(0, "Purchase price cannot be negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose }) => {
  const { createProduct, updateProduct, products, categories } = usePOS();
  const { t } = useLanguage();
  const isEditing = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: initialData?.id || "",
      name: initialData?.name || "",
      price: initialData?.price || 1,
      purchasePrice: initialData?.purchasePrice || 0,
      stock: initialData?.stock || 0,
      categoryId: initialData?.categoryId || undefined,
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    const imageUrl = values.imageUrl || undefined;
    const categoryId = values.categoryId === "none" ? undefined : values.categoryId;
    const roundedPrice = Math.round(values.price);
    const roundedPurchasePrice = Math.round(values.purchasePrice);

    if (isEditing) {
      updateProduct({ 
        ...initialData, 
        ...values, 
        price: roundedPrice, 
        purchasePrice: roundedPurchasePrice,
        categoryId,
        imageUrl 
      });
    } else {
      if (!values.id || products.some(p => p.id === values.id)) {
        form.setError("id", {
          type: "manual",
          message: values.id ? "Product ID already exists or is empty." : "Product ID (Barcode) is required.",
        });
        return;
      }
      createProduct(values.id, values.name, roundedPrice, roundedPurchasePrice, values.stock, categoryId, imageUrl);
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEditing && (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Produk / Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan ID unik atau scan barcode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {isEditing && (
            <FormItem>
                <FormLabel>ID Produk / Barcode</FormLabel>
                <Input value={initialData.id} disabled className="font-mono" />
            </FormItem>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("productName")}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee Mug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("noCategory")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("priceCurrency")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="3500"
                      value={field.value}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(parseFloat(val) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("purchasePriceCurrency")}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="2500"
                      value={field.value}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(parseFloat(val) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("stockQuantityLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(parseInt(val) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("imageUrl")}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">{initialData ? t("saveChanges") : t("createProduct")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ProductForm;