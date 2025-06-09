import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Wand2, Download } from 'lucide-react';

interface WatermarkRemovalProps {
  imageUrl: string;
  onProcessed?: (processedImageUrl: string) => void;
}

interface WatermarkRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export default function WatermarkRemoval({ imageUrl, onProcessed }: WatermarkRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedRegions, setDetectedRegions] = useState<WatermarkRegion[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Smart watermark detection algorithm
  const detectWatermarks = async (imageElement: HTMLImageElement): Promise<WatermarkRegion[]> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const regions: WatermarkRegion[] = [];

    // Common watermark positions and characteristics
    const commonPositions = [
      { x: canvas.width - 80, y: canvas.height - 60, width: 80, height: 60 }, // Bottom-right
      { x: 0, y: canvas.height - 60, width: 80, height: 60 }, // Bottom-left
      { x: canvas.width - 80, y: 0, width: 80, height: 60 }, // Top-right
      { x: 0, y: 0, width: 80, height: 60 }, // Top-left
    ];

    for (const pos of commonPositions) {
      const region = analyzeRegion(data, canvas.width, canvas.height, pos);
      if (region.confidence > 0.7) {
        regions.push(region);
      }
    }

    return regions;
  };

  const analyzeRegion = (
    data: Uint8ClampedArray,
    imgWidth: number,
    imgHeight: number,
    region: { x: number; y: number; width: number; height: number }
  ): WatermarkRegion => {
    let totalPixels = 0;
    let transparentPixels = 0;
    let grayPixels = 0;
    let textLikePixels = 0;

    for (let y = region.y; y < Math.min(region.y + region.height, imgHeight); y++) {
      for (let x = region.x; x < Math.min(region.x + region.width, imgWidth); x++) {
        const index = (y * imgWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        totalPixels++;

        // Check for transparency
        if (a < 255) transparentPixels++;

        // Check for grayscale (common in watermarks)
        if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10) {
          grayPixels++;
        }

        // Check for text-like patterns (high contrast edges)
        if (x < imgWidth - 1 && y < imgHeight - 1) {
          const nextIndex = ((y) * imgWidth + (x + 1)) * 4;
          const belowIndex = ((y + 1) * imgWidth + x) * 4;
          
          const edgeStrength = Math.abs(r - data[nextIndex]) + Math.abs(r - data[belowIndex]);
          if (edgeStrength > 100) textLikePixels++;
        }
      }
    }

    // Calculate confidence based on watermark characteristics
    const transparencyRatio = transparentPixels / totalPixels;
    const grayRatio = grayPixels / totalPixels;
    const textRatio = textLikePixels / totalPixels;

    let confidence = 0;
    
    // Higher confidence for regions with transparency, grayscale, and text-like patterns
    confidence += transparencyRatio * 0.3;
    confidence += grayRatio * 0.4;
    confidence += textRatio * 0.3;

    // Boost confidence for corner regions (common watermark locations)
    if ((region.x + region.width > imgWidth * 0.8 && region.y + region.height > imgHeight * 0.8) ||
        (region.x < imgWidth * 0.2 && region.y + region.height > imgHeight * 0.8)) {
      confidence += 0.2;
    }

    return {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      confidence: Math.min(confidence, 1)
    };
  };

  const removeWatermarks = async (regions: WatermarkRegion[]) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    ctx.drawImage(imageRef.current, 0, 0);

    // Process each detected region
    for (const region of regions) {
      await removeWatermarkFromRegion(ctx, region);
    }

    // Convert canvas to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
        onProcessed?.(url);
      }
    }, 'image/png');
  };

  const removeWatermarkFromRegion = async (ctx: CanvasRenderingContext2D, region: WatermarkRegion) => {
    const imageData = ctx.getImageData(region.x, region.y, region.width, region.height);
    const data = imageData.data;

    // Advanced inpainting algorithm using surrounding pixels
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const index = (y * region.width + x) * 4;
        
        // Sample surrounding pixels for content-aware fill
        const surroundingColors = getSurroundingColors(ctx, region.x + x, region.y + y, 5);
        
        if (surroundingColors.length > 0) {
          const avgColor = averageColors(surroundingColors);
          data[index] = avgColor.r;
          data[index + 1] = avgColor.g;
          data[index + 2] = avgColor.b;
          data[index + 3] = 255; // Full opacity
        }
      }
    }

    ctx.putImageData(imageData, region.x, region.y);
  };

  const getSurroundingColors = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const colors = [];
    const canvas = ctx.canvas;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          colors.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
        }
      }
    }

    return colors;
  };

  const averageColors = (colors: { r: number; g: number; b: number }[]) => {
    const sum = colors.reduce((acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b
    }), { r: 0, g: 0, b: 0 });

    return {
      r: Math.round(sum.r / colors.length),
      g: Math.round(sum.g / colors.length),
      b: Math.round(sum.b / colors.length)
    };
  };

  const processImage = async () => {
    if (!imageRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Step 1: Load and analyze image
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Detect watermarks
      setProgress(40);
      const regions = await detectWatermarks(imageRef.current);
      setDetectedRegions(regions);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Remove watermarks
      setProgress(70);
      await removeWatermarks(regions);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Complete
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (!processedImageUrl) return;

    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-luxury-black/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Smart Watermark Removal</h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowOverlays(!showOverlays)}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {showOverlays ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          {processedImageUrl && (
            <Button
              size="sm"
              onClick={downloadProcessedImage}
              className="bg-white text-luxury-black hover:bg-platinum"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Original"
          className="w-full h-auto rounded-lg"
          crossOrigin="anonymous"
        />
        
        {/* Overlay detected regions */}
        {showOverlays && detectedRegions.map((region, index) => (
          <div
            key={index}
            className="absolute border-2 border-red-400 bg-red-400/20 animate-pulse"
            style={{
              left: `${(region.x / imageRef.current?.naturalWidth! * 100)}%`,
              top: `${(region.y / imageRef.current?.naturalHeight! * 100)}%`,
              width: `${(region.width / imageRef.current?.naturalWidth! * 100)}%`,
              height: `${(region.height / imageRef.current?.naturalHeight! * 100)}%`,
            }}
          >
            <div className="absolute -top-6 left-0 text-xs text-red-400 bg-luxury-black px-2 py-1 rounded">
              {Math.round(region.confidence * 100)}%
            </div>
          </div>
        ))}

        {/* Processed image overlay */}
        {processedImageUrl && (
          <div className="absolute inset-0 bg-luxury-black/80 flex items-center justify-center rounded-lg">
            <img
              src={processedImageUrl}
              alt="Processed"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-steel">
            <span>Processing image...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-steel">
          {detectedRegions.length > 0 && (
            <span>{detectedRegions.length} watermark{detectedRegions.length !== 1 ? 's' : ''} detected</span>
          )}
        </div>
        <Button
          onClick={processImage}
          disabled={isProcessing}
          className="bg-white text-luxury-black hover:bg-platinum"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Remove Watermarks'}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}