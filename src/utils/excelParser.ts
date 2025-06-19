
import * as XLSX from 'xlsx';

export interface Product {
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
            // Based on your Excel structure:
            // A: STOK KODU, B: FİRMA, C: ÜRÜN ADI, D: BİRİM, 
            // E: RAF FİYATI, F: İSKONTO ORANI, G: LİSTE FİYATI
            const product: Product = {
              stokKodu: String(row[0] || '').trim(),
              firma: String(row[1] || '').trim(),
              urunAdi: String(row[2] || '').trim(),
              birim: String(row[3] || '').trim(),
              rafFiyati: parseFloat(String(row[4] || '0').replace(',', '.')) || 0,
              iskontoOrani: parseFloat(String(row[5] || '0').replace(',', '.')) || 0,
              listeFiyati: parseFloat(String(row[6] || '0').replace(',', '.')) || 0,
              resimYolu: row[7] ? String(row[7]).trim() : undefined,
              supplier: file.name
            };
            
            // Only add products with valid data
            if (product.stokKodu && product.urunAdi && product.listeFiyati > 0) {
              products.push(product);
              console.log(`Added product: ${product.urunAdi} - ${product.listeFiyati} TL`);
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
