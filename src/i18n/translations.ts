export type Language = 'id';

export const defaultLanguage: Language = 'id';

export const translations = {
  id: {
    // General
    appName: "Dyad POS",
    madeWithDyad: "Dibuat dengan Dyad",
    saveChanges: "Simpan Perubahan",
    cancel: "Batal",
    delete: "Hapus",
    actions: "Aksi",
    edit: "Edit",
    save: "Simpan",

    // Navigation
    cashierInterface: "Antarmuka Kasir",
    stockManagement: "Manajemen Stok",
    cashier: "Kasir",
    stock: "Inventaris",
    orderHistory: "Riwayat Pesanan",
    salesReports: "Laporan Penjualan",
    settings: "Pengaturan",
    categories: "Kategori",

    // Settings
    storeIdentity: "Identitas Toko",
    storeName: "Nama Toko",
    storeLogoUrl: "URL Logo Toko",
    storeAddress: "Alamat Toko",
    storePhone: "Nomor Telepon",
    receiptNotes: "Catatan di Struk",
    updateIdentity: "Perbarui Identitas",
    toastStoreUpdated: "Identitas toko berhasil diperbarui.",
    receiptSettings: "Pengaturan Struk",

    // Cashier
    productSelection: "Pilihan Produk",
    currentOrder: "Pesanan Saat Ini",
    emptyCart: "Klik pada produk untuk menambahkannya ke keranjang.",
    subtotal: "Subtotal:",
    tax: "Pajak",
    total: "Total:",
    processPayment: "Proses Pembayaran",
    taxIncludedToggle: "Harga termasuk Pajak (11%)",
    tenderedAmount: "Uang Diterima",
    change: "Kembalian",
    allCategories: "Semua Kategori",
    
    // Receipt Dialog
    receiptTitle: "Struk Pembayaran",
    thankYou: "Terima kasih atas pembelian Anda!",
    transactionId: "ID Transaksi",
    totalPaid: "Total Dibayar",
    printReceipt: "Cetak Struk",
    tendered: "Diterima",
    changeDue: "Kembalian",

    // Stock Management
    inventoryList: "Daftar Inventaris ({count} item)",
    addNewProduct: "Tambah Produk Baru",
    name: "Nama",
    price: "Harga Jual",
    purchasePrice: "Harga Beli",
    stockQuantity: "Stok",
    category: "Kategori",
    noCategory: "Tanpa Kategori",

    // Product Form
    editProduct: "Edit Produk",
    createNewProduct: "Buat Produk Baru",
    productName: "Nama Produk",
    priceCurrency: "Harga Jual (Rp)",
    purchasePriceCurrency: "Harga Beli (Rp)",
    stockQuantityLabel: "Kuantitas Stok",
    imageUrl: "URL Gambar (Opsional)",
    createProduct: "Buat Produk",
    selectCategory: "Pilih Kategori",

    // Categories Page
    manageCategories: "Manajemen Kategori",
    categoryName: "Nama Kategori",
    addCategory: "Tambah Kategori",
    confirmDeleteCategory: "Hapus kategori ini? Produk dengan kategori ini akan menjadi 'Tanpa Kategori'.",

    // Order History
    date: "Tanggal",
    itemsSold: "Item Terjual",
    totalAmount: "Jumlah Total",
    noOrdersYet: "Belum ada pesanan yang diproses.",

    // Sales Reports
    totalRevenue: "Total Pendapatan",
    totalProfit: "Total Keuntungan",
    totalTransactions: "Total Transaksi",
    totalItemsSold: "Total Item Terjual",
    basedOnTransactions: "Berdasarkan semua transaksi yang diproses",
    profitDescription: "Selisih harga jual dan modal produk",
    ordersProcessed: "Pesanan Diproses",
    unitsSold: "Unit Terjual",
    weeklySalesOverview: "Ringkasan Penjualan Mingguan (Data Mock)",
    sales: "Penjualan",

    // Alerts/Toasts
    confirmDeleteTitle: "Apakah Anda benar-benar yakin?",
    confirmDeleteDescription: "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk {productName} secara permanen dari inventaris.",
    insufficientFunds: "Uang yang diterima ({tendered}) kurang dari total pembayaran ({total}).",
    toastItemAdded: "Item ditambahkan ke keranjang.",
    toastItemRemoved: "Item dihapus dari keranjang.",
    toastCheckoutSuccess: "Checkout berhasil! Total: {total}",
    toastCartEmpty: "Keranjang kosong.",
    toastStockLimit: "Tidak dapat menambahkan lebih dari {stock} {productName} ke keranjang.",
    toastStockOnly: "Hanya {stock} yang tersedia di stok.",
    toastProductUpdated: "Produk {productName} diperbarui.",
    toastProductCreated: "Produk {productName} dibuat.",
    toastProductDeleted: "Produk {productName} dihapus.",
    toastCategoryCreated: "Kategori {categoryName} berhasil dibuat.",
    toastCategoryUpdated: "Kategori berhasil diperbarui.",
    toastCategoryDeleted: "Kategori berhasil dihapus.",
  },
};

export type TranslationKeys = keyof typeof translations.id;