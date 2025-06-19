
import React, { useState } from 'react';
import { Upload, X, Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { parseExcelFile } from '../utils/excelParser';

interface FileUploadProps {
  onFilesProcessed: (products: any[], fileName: string) => void;
  uploadedFiles: { name: string; products: any[]; }[];
  onFileRemoved: (fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed, uploadedFiles, onFileRemoved }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    if (uploadedFiles.length + files.length > 30) {
      toast({
        title: "Dosya Limiti",
        description: "Maksimum 30 dosya yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);
        
        if (uploadedFiles.some(f => f.name === file.name)) {
          toast({
            title: "Dosya Zaten Mevcut",
            description: `${file.name} dosyası zaten yüklenmiş.`,
            variant: "destructive",
          });
          continue;
        }

        const products = await parseExcelFile(file);
        console.log(`Parsed ${products.length} products from ${file.name}`);
        
        onFilesProcessed(products, file.name);
        
        toast({
          title: "Dosya Yüklendi",
          description: `${file.name} başarıyla işlendi. ${products.length} ürün bulundu.`,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast({
          title: "Hata",
          description: `${file.name} dosyası işlenirken hata oluştu.`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  };

  const removeFile = (fileName: string) => {
    onFileRemoved(fileName);
    toast({
      title: "Dosya Silindi",
      description: `${fileName} başarıyla silindi.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Excel Dosyalarını Yükle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Excel dosyalarını buraya sürükleyin veya seçin
            </p>
            <p className="text-sm text-gray-500 mb-4">
              .xlsx, .xls ve .csv dosyaları desteklenir (Maksimum 30 dosya)
            </p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Dosya Seç
              </label>
            </Button>
          </div>
          
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Dosyalar işleniyor...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Yüklenen Dosyalar ({uploadedFiles.length}/30)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.products.length} ürün
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
