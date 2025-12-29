import * as React from "react";
import { usePOS } from "@/hooks/use-pos-store";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CategoriesPage = () => {
  const { categories, createCategory, updateCategory, deleteCategory } = usePOS();
  const { t } = useLanguage();
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      createCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = (id: string) => {
    if (editingName.trim()) {
      updateCategory(id, editingName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{t("manageCategories")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("addCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder={t("categoryName")}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" /> {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("categoryName")}</TableHead>
              <TableHead className="w-[150px] text-center">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {editingId === category.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                      autoFocus
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    {editingId === category.id ? (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleUpdate(category.id)}>
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={cancelEditing}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="icon" onClick={() => startEditing(category.id, category.name)}>
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
                              <AlertDialogDescription>{t("confirmDeleteCategory")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
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

export default CategoriesPage;