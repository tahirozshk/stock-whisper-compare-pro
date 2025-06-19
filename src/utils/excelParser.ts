
import * as XLSX from 'xlsx';

export interface Product {
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

export const parseExcelFile = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`Processing ${file.name} with ${jsonData.length} rows`);
        console.log('First few rows:', jsonData.slice(0, 5));
        
        const products: Product[] = [];
        
        // Skip header row (index 0) and process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) continue;
          
          console.log(`Processing row ${i}:`, row);
          
          try {
            // Excel structure based on console logs:
            // A (0): Stok Kodu, B (1): Firma, C (2): Ürün Adı, D (3): Birim
            // E (4): Liste Fiyatı, F (5): İskonto %5, G (6): İskonto %10, 
            // H (7): İskonto %15, I (8): KDV Oranı
            
            const stokKodu = String(row[0] || '').trim();
            const firma = String(row[1] || '').trim();
            const urunAdi = String(row[2] || '').trim();
            const birim = String(row[3] || '').trim();
            const listeFiyati = parseFloat(String(row[4] || '0').replace(',', '.')) || 0;
            const iskonto5 = parseFloat(String(row[5] || '0').replace(',', '.')) || 0;
            const iskonto10 = parseFloat(String(row[6] || '0').replace(',', '.')) || 0;
            const iskonto15 = parseFloat(String(row[7] || '0').replace(',', '.')) || 0;
            const kdvOrani = parseFloat(String(row[8] || '0').replace(',', '.')) || 0;
            
            // Find the lowest price (most advantageous discount)
            const discountPrices = [iskonto5, iskonto10, iskonto15].filter(price => price > 0);
            const enDusukFiyat = discountPrices.length > 0 ? Math.min(...discountPrices) : listeFiyati;
            
            const product: Product = {
              stokKodu: stokKodu || `${file.name}-${i}`, // Use actual stock code or generate one
              firma: firma || file.name.replace(/\.[^/.]+$/, ""), // Use actual company or filename
              urunAdi,
              birim: birim || undefined,
              listeFiyati,
              iskonto5: iskonto5 > 0 ? iskonto5 : undefined,
              iskonto10: iskonto10 > 0 ? iskonto10 : undefined,
              iskonto15: iskonto15 > 0 ? iskonto15 : undefined,
              kdvOrani: kdvOrani > 0 ? kdvOrani : undefined,
              enDusukFiyat,
              supplier: file.name
            };
            
            // Only add products with valid data - check for actual product name and reasonable price
            if (product.urunAdi && product.urunAdi.length > 2 && product.listeFiyati > 0) {
              products.push(product);
              console.log(`Added product: ${product.urunAdi} - En düşük: ${product.enDusukFiyat} TL`);
            } else {
              console.log(`Skipped invalid row ${i}:`, {
                urunAdi: product.urunAdi,
                listeFiyati: product.listeFiyati,
                reason: !product.urunAdi ? 'No product name' : product.urunAdi.length <= 2 ? 'Product name too short' : 'Invalid price'
              });
            }
          } catch (error) {
            console.error(`Error processing row ${i}:`, error, row);
          }
        }
        
        console.log(`Successfully parsed ${products.length} products from ${file.name}`);
        resolve(products);
        
      } catch (error) {
        console.error(`Error parsing Excel file ${file.name}:`, error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsBinaryString(file);
  });
};
