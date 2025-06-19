
import React, { useState, useMemo } from 'react';
import { Search, Calculator, Package, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfitCalculator from './ProfitCalculator';

interface Product {
  stokKodu: string;
  firma: string;
  urunAdi: string;
  birim: string;
  rafFiyati: number;
  iskontoOrani: number;
  listeFiyati: number;
  resimYolu?: string;
  supplier: string;
}

interface ProductSearchProps {
  allProducts: Product[];
}

const ProductSearch: React.FC<ProductSearchProps> = ({ allProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductForCalculator, setSelectedProductForCalculator] = useState<Product | null>(null);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    console.log(`Searching for: "${searchTerm}"`);
    console.log(`Total products to search: ${allProducts.length}`);
    
    const filtered = allProducts.filter(product => 
      product.urunAdi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.stokKodu?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log(`Found ${filtered.length} matching products`);
    
    // Fiyata göre sırala (ucuzdan pahalıya)
    const sorted = filtered.sort((a, b) => {
      const priceA = a.listeFiyati || 0;
      const priceB = b.listeFiyati || 0;
      return priceA - priceB;
    });
    
    // İlk 10 sonucu göster
    return sorted.slice(0, 10);
  }, [searchTerm, allProducts]);

  const handleCalculatorOpen = (product: Product) => {
    setSelectedProductForCalculator(product);
  };

  const handleCalculatorClose = () => {
    setSelectedProductForCalculator(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ürün Ara
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Ürün adı veya stok kodu ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Arama Sonuçları ({searchResults.length} ürün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((product, index) => (
                <div
                  key={`${product.supplier}-${product.stokKodu}-${index}`}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.resimYolu ? (
                          <img
                            src={product.resimYolu}
                            alt={product.urunAdi}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {product.urunAdi}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            {product.firma}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Kod: {product.stokKodu}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Dosya: {product.supplier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold text-green-600">
                            ₺{product.listeFiyati?.toFixed(2)}
                          </div>
                          {product.rafFiyati && product.rafFiyati !== product.listeFiyati && (
                            <div className="text-sm text-gray-500 line-through">
                              ₺{product.rafFiyati?.toFixed(2)}
                            </div>
                          )}
                          {product.iskontoOrani > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              %{product.iskontoOrani} İndirim
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCalculatorOpen(product)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Calculator className="h-4 w-4" />
                      Kar Hesapla
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Ürün bulunamadı</p>
            <p className="text-gray-500">
              "{searchTerm}" için hiçbir ürün bulunamadı. Farklı anahtar kelimeler deneyin.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedProductForCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Kar Hesaplayıcı</h2>
                <Button variant="ghost" onClick={handleCalculatorClose}>
                  ×
                </Button>
              </div>
              <ProfitCalculator 
                selectedProducts={[selectedProductForCalculator]} 
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
