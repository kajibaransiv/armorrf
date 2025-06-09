import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onScrollToProduct?: () => void;
}

export default function HeroSection({ onScrollToProduct }: HeroSectionProps) {
  return (
    <section className="min-h-screen relative flex items-center justify-center">
      {/* Hero Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => console.error('Video failed to load:', e)}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="/attached_assets/a7d79c66-bf48-4934-9463-73ad5b83bc38%20(1)_1749324149560.mp4" type="video/mp4" />
        {/* Fallback background image */}
        Your browser does not support the video tag.
      </video>
      
      {/* Fallback background image if video fails */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/attached_assets/image-232x348_1749315669548.jpg')",
          zIndex: -1
        }}
      />
      
      {/* Video Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-shadow-luxury">
          The Future of<br />
          <span className="text-silver">Wearable Protection</span>
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 text-platinum max-w-2xl mx-auto leading-relaxed">
          The world's most advanced EMF-protective hoodie.<br />
          German-made Silverell® × 100% Organic Cotton.
        </p>
        <Button 
          onClick={onScrollToProduct}
          className="bg-white text-luxury-black px-8 py-4 text-lg font-semibold hover:bg-platinum transition-all duration-300 transform hover:scale-105"
        >
          Discover ArmorRF
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-platinum" />
      </div>
    </section>
  );
}
