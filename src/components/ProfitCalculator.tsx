
import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface ProfitCalculatorProps {
  selectedProducts: Product[];
  isModal?: boolean;
}

type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ selectedProducts, isModal = false }) => {
  const [profitMargin, setProfitMargin] = useState<number>(35);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Get exchange rates
    const getExchangeRates = async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*');
      
      if (data && !error) {
        const rates: Record<string, number> = {};
        data.forEach(rate => {
          rates[rate.currency_code] = rate.rate_to_try;
        });
        setExchangeRates(rates);
      }
    };
    getExchangeRates();
  }, []);

  const convertPrice = (price: number, fromCurrency: Currency): number => {
    if (fromCurrency === 'TRY') return price;
    const rate = exchangeRates[fromCurrency] || 1;
    return price * rate;
  };

  const convertFromTRY = (price: number, toCurrency: Currency): number => {
    if (toCurrency === 'TRY') return price;
    const rate = exchangeRates[toCurrency] || 1;
    return price / rate;
  };

  const calculateSellingPrice = (costPrice: number, margin: number, discount: number = 0): number => {
    const discountedPrice = costPrice * (1 - discount / 100);
    return discountedPrice / (1 - margin / 100);
  };

  const saveProfitCalculation = async (product: Product, finalPrice: number, originalPrice: number) => {
    if (!user) {
      toast({
        title: "Giriş Gerekli",
        description: "Hesaplamaları kaydetmek için giriş yapmanız gerekiyor.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('profit_calculations')
      .insert({
        user_id: user.id,
        product_name: product.urunAdi,
        supplier_name: product.supplier,
        original_price: originalPrice,
        profit_margin: profitMargin,
        final_price: finalPrice,
        currency: selectedCurrency
      });

    if (error) {
      toast({
        title: "Hata",
        description: "Hesaplama kaydedilemedi.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Kaydedildi",
        description: "Kar hesaplaması başarıyla kaydedildi."
      });
    }
  };

  const currencySymbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="custom-discount">Ek İndirim (%)</Label>
              <Input
                id="custom-discount"
                type="number"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(Number(e.target.value))}
                placeholder="Ek indirim oranı"
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label>Para Birimi</Label>
              <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">ABD Doları ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">İngiliz Sterlini (£)</SelectItem>
                  <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
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
              // Use the lowest price as base cost
              const baseCostTRY = product.enDusukFiyat;
              const costPriceInCurrency = convertFromTRY(baseCostTRY, selectedCurrency);
              const sellingPriceInCurrency = calculateSellingPrice(costPriceInCurrency, profitMargin, customDiscount);
              const profitInCurrency = sellingPriceInCurrency - costPriceInCurrency;
              
              // Convert back to TRY for saving
              const sellingPriceInTRY = convertPrice(sellingPriceInCurrency, selectedCurrency);
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{product.urunAdi}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Firma: {product.firma}</p>
                        <p>Dosya: {product.supplier}</p>
                        <p>En Düşük Fiyat (TRY): ₺{product.enDusukFiyat.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Iskonto detayları */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Mevcut İndirimler:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>Liste: ₺{product.listeFiyati.toFixed(2)}</div>
                      {product.iskonto5 && <div>%5: ₺{product.iskonto5.toFixed(2)}</div>}
                      {product.iskonto10 && <div>%10: ₺{product.iskonto10.toFixed(2)}</div>}
                      {product.iskonto15 && <div>%15: ₺{product.iskonto15.toFixed(2)}</div>}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Maliyet Fiyatı ({selectedCurrency}):</span>
                      <span className="font-bold text-blue-600">
                        {currencySymbols[selectedCurrency]}{costPriceInCurrency.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Kar Marjı:</span>
                      <span className="font-medium text-orange-600">%{profitMargin}</span>
                    </div>
                    {customDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Ek İndirim:</span>
                        <span className="font-medium text-red-600">%{customDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Kar Miktarı ({selectedCurrency}):</span>
                      <span className="font-bold text-green-600">
                        {currencySymbols[selectedCurrency]}{profitInCurrency.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">TL Karşılığı:</span>
                      <span className="font-medium text-gray-700">
                        ₺{sellingPriceInTRY.toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Satış Fiyatı ({selectedCurrency}):</span>
                      <span className="text-xl font-bold text-green-700">
                        {currencySymbols[selectedCurrency]}{sellingPriceInCurrency.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={() => saveProfitCalculation(product, sellingPriceInTRY, baseCostTRY)}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Save className="h-4 w-4" />
                        Hesaplamayı Kaydet
                      </Button>
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
