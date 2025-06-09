import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import WatermarkRemoval from '@/components/watermark-removal';

export default function WatermarkTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleProcessedImage = (processedUrl: string) => {
    setProcessedImages(prev => [...prev, processedUrl]);
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Detection",
      description: "Automatically detects watermarks using advanced computer vision algorithms"
    },
    {
      icon: ImageIcon,
      title: "Content-Aware Removal",
      description: "Intelligently fills removed areas using surrounding image content"
    },
    {
      icon: Upload,
      title: "High-Quality Output",
      description: "Maintains original image quality while seamlessly removing watermarks"
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Smart Watermark
            <span className="text-silver block">Removal Tool</span>
          </h1>
          <p className="text-xl text-platinum font-light mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional-grade AI watermark removal with intelligent overlay detection and content-aware filling.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-luxury-black/50 border-steel/20 p-6 text-center">
                <feature.icon className="w-12 h-12 text-silver mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-steel text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!imageUrl ? (
            <Card className="bg-luxury-black/50 border-steel/20 p-8">
              <div
                className="border-2 border-dashed border-steel/30 rounded-lg p-12 text-center cursor-pointer hover:border-silver/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-steel mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your Image</h3>
                <p className="text-steel mb-4">
                  Drag and drop an image here, or click to select a file
                </p>
                <p className="text-sm text-steel/70">
                  Supports JPG, PNG, and other common image formats
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-white">
                  Processing: {selectedFile?.name}
                </h2>
                <Button
                  onClick={() => {
                    setImageUrl(null);
                    setSelectedFile(null);
                    setProcessedImages([]);
                  }}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Upload New Image
                </Button>
              </div>

              <WatermarkRemoval
                imageUrl={imageUrl}
                onProcessed={handleProcessedImage}
              />

              {/* Processed Images Gallery */}
              {processedImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Processed Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedImages.map((url, index) => (
                      <Card key={index} className="bg-luxury-black/30 border-steel/20 p-4">
                        <img
                          src={url}
                          alt={`Processed ${index + 1}`}
                          className="w-full h-auto rounded-lg mb-4"
                        />
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `processed-image-${index + 1}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full bg-white text-luxury-black hover:bg-platinum"
                        >
                          Download Image {index + 1}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-luxury-black/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload", description: "Select your image with watermarks" },
              { step: "2", title: "Detect", description: "AI identifies watermark regions automatically" },
              { step: "3", title: "Remove", description: "Smart algorithms remove watermarks seamlessly" },
              { step: "4", title: "Download", description: "Get your clean, professional image" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-silver text-luxury-black rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-steel text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}