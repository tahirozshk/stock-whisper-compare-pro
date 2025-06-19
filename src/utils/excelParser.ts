
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
        
        const products: Product[] = [];
        
        // Skip header row (index 0) and process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) continue;
          
          console.log(`Processing row ${i}:`, row);
          
          try {
            // New Excel structure:
            // A: Ürün Adı, B: Liste Fiyatı, C: İskonto %5 Fiyatı, 
            // D: İskonto %10 Fiyatı, E: İskonto %15 Fiyatı, F: KDV Oranı
            const urunAdi = String(row[0] || '').trim();
            const listeFiyati = parseFloat(String(row[1] || '0').replace(',', '.')) || 0;
            const iskonto5 = parseFloat(String(row[2] || '0').replace(',', '.')) || 0;
            const iskonto10 = parseFloat(String(row[3] || '0').replace(',', '.')) || 0;
            const iskonto15 = parseFloat(String(row[4] || '0').replace(',', '.')) || 0;
            const kdvOrani = parseFloat(String(row[5] || '0').replace(',', '.')) || 0;
            
            // Find the lowest price (most advantageous discount)
            const discountPrices = [iskonto5, iskonto10, iskonto15].filter(price => price > 0);
            const enDusukFiyat = discountPrices.length > 0 ? Math.min(...discountPrices) : listeFiyati;
            
            const product: Product = {
              stokKodu: `${file.name}-${i}`, // Generate unique code
              firma: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for company name
              urunAdi,
              listeFiyati,
              iskonto5: iskonto5 > 0 ? iskonto5 : undefined,
              iskonto10: iskonto10 > 0 ? iskonto10 : undefined,
              iskonto15: iskonto15 > 0 ? iskonto15 : undefined,
              kdvOrani: kdvOrani > 0 ? kdvOrani : undefined,
              enDusukFiyat,
              supplier: file.name
            };
            
            // Only add products with valid data
            if (product.urunAdi && product.listeFiyati > 0) {
              products.push(product);
              console.log(`Added product: ${product.urunAdi} - En düşük: ${product.enDusukFiyat} TL`);
            } else {
              console.log(`Skipped invalid row ${i}:`, product);
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
