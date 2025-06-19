
import React, { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ProfitCalculatorProps {
  selectedProducts: Product[];
  isModal?: boolean;
}

type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

const exchangeRates: Record<Currency, number> = {
  TRY: 1,
  USD: 0.031,
  EUR: 0.028,
  GBP: 0.024
};

const currencySymbols: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ selectedProducts, isModal = false }) => {
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('TRY');

  const convertPrice = (price: number, currency: Currency): number => {
    return price * exchangeRates[currency];
  };

  const calculateSellingPrice = (costPrice: number, margin: number): number => {
    return costPrice * (1 + margin / 100);
  };

  if (!selectedProducts || selectedProducts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Kar Hesaplayıcı</p>
          <p className="text-gray-500">
            Kar hesaplamak için önce ürün arayın ve "Kar Hesapla" butonuna tıklayın.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Kar Hesaplayıcı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profit-margin">Kar Marjı (%)</Label>
              <Input
                id="profit-margin"
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                placeholder="Kar marjı giriniz"
                min="0"
                max="1000"
              />
            </div>
            <div>
              <Label>Para Birimi</Label>
              <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                  <SelectItem value="USD">ABD Doları ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">İngiliz Sterlini (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hesaplama Sonuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedProducts.map((product, index) => {
              const costPrice = convertPrice(product.listeFiyati || 0, selectedCurrency);
              const sellingPrice = calculateSellingPrice(costPrice, profitMargin);
              const profit = sellingPrice - costPrice;
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{product.urunAdi}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Firma: {product.firma}</p>
                        <p>Dosya: {product.supplier}</p>
                        <p>Stok Kodu: {product.stokKodu}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Maliyet Fiyatı:</span>
                      <span className="font-bold text-blue-600">
                        {currencySymbols[selectedCurrency]}{costPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Kar Marjı:</span>
                      <span className="font-medium text-orange-600">%{profitMargin}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Kar Miktarı:</span>
                      <span className="font-bold text-green-600">
                        {currencySymbols[selectedCurrency]}{profit.toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Satış Fiyatı:</span>
                      <span className="text-xl font-bold text-green-700">
                        {currencySymbols[selectedCurrency]}{sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitCalculator;
