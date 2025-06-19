
import React, { useState } from 'react';
import { Package, Search, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import FileUpload from '@/components/FileUpload';
import ProductSearch from '@/components/ProductSearch';

interface Product {
  stokKodu: string;
  firma: string;
  urunAdi: string;
  birim?: string;
  listeFiyati: number;
  iskonto5?: number;
  iskonto10?: number;
  iskonto15?: number;
  kdvOrani?: number;
  enDusukFiyat: number;
  resimYolu?: string;
  supplier: string;
}

const Index = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; products: Product[]; }[]>([]);

  const handleFilesProcessed = (products: Product[], fileName: string) => {
    console.log(`Adding products from ${fileName}:`, products.length);
    
    const productsWithSupplier = products.map(product => ({
      ...product,
      supplier: fileName
    }));
    
    setAllProducts(prev => [...prev, ...productsWithSupplier]);
    setUploadedFiles(prev => [...prev, { name: fileName, products: productsWithSupplier }]);
  };

  const handleFileRemoved = (fileName: string) => {
    console.log(`Removing file: ${fileName}`);
    
    setAllProducts(prev => prev.filter(product => product.supplier !== fileName));
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const uniqueProductCodes = new Set(allProducts.map(p => p.stokKodu)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Depo Hesaplayıcı
          </h1>
          <p className="text-gray-600">
            Tedarikçi fiyatlarını karşılaştırın ve kar marjınızı hesaplayın
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tedarikçi Sayısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {uploadedFiles.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Ürün
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allProducts.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Benzersiz Ürün Kodu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {uniqueProductCodes}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sistem Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={allProducts.length > 0 ? "default" : "secondary"}
                className="text-sm"
              >
                {allProducts.length > 0 ? "Hazır" : "Dosya Bekliyor"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Dosya Yükle
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Ürün Ara
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <FileUpload 
              onFilesProcessed={handleFilesProcessed}
              uploadedFiles={uploadedFiles}
              onFileRemoved={handleFileRemoved}
            />
          </TabsContent>

          <TabsContent value="search">
            <ProductSearch 
              allProducts={allProducts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
