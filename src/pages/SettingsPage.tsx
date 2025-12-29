import * as React from "react";
import { usePOS } from "@/hooks/use-pos-store";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Store, Image as ImageIcon, Receipt, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsPage = () => {
  const { 
    storeName, storeLogo, storeAddress, storePhone, receiptNotes, 
    updateStoreIdentity 
  } = usePOS();
  const { t } = useLanguage();
  
  const [name, setName] = React.useState(storeName);
  const [logo, setLogo] = React.useState(storeLogo || "");
  const [address, setAddress] = React.useState(storeAddress);
  const [phone, setPhone] = React.useState(storePhone);
  const [notes, setNotes] = React.useState(receiptNotes);
  const [uploading, setUploading] = React.useState(false);

  // Sync state with store if it changes elsewhere
  React.useEffect(() => {
    setName(storeName);
    setLogo(storeLogo || "");
    setAddress(storeAddress);
    setPhone(storePhone);
    setNotes(receiptNotes);
  }, [storeName, storeLogo, storeAddress, storePhone, receiptNotes]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogo(publicUrl);
      toast.success("Logo berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah logo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreIdentity(name, logo || null, address, phone, notes);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h2 className="text-2xl font-bold">{t("settings")}</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {t("storeIdentity")}
            </CardTitle>
            <CardDescription>
              Ubah informasi dasar toko Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">{t("storeName")}</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Toko"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store-logo-file">Logo Toko</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 border rounded-lg flex items-center justify-center bg-muted overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="store-logo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: JPG, PNG, atau SVG. Maks 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-logo-url">{t("storeLogoUrl")} (Optional)</Label>
              <Input
                id="store-logo-url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t("receiptSettings")}
            </CardTitle>
            <CardDescription>
              Informasi tambahan yang akan muncul di struk belanja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-address">{t("storeAddress")}</Label>
              <Input
                id="store-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Merdeka No. 123, Jakarta"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store-phone">{t("storePhone")}</Label>
              <Input
                id="store-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-notes">{t("receiptNotes")}</Label>
              <Textarea
                id="receipt-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Terima kasih atas pembelian Anda!"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <Button type="submit" className="w-full" disabled={uploading}>
          {t("updateIdentity")}
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;