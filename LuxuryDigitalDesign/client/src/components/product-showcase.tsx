import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, RotateCcw, Shield, Leaf, Cog, Zap, Radio, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import InteractiveShieldingChart from "@/components/interactive-shielding-chart";

export default function ProductShowcase() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState<string>("full");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Shielding effectiveness data based on LessEMF Silverell specifications
  const shieldingData = {
    full: { label: "Full Spectrum", range: "10 kHz - 40 GHz", effectiveness: "90%+", attenuation: "20-30 dB" },
    "2g": { label: "2G (GSM)", range: "850-1900 MHz", effectiveness: "95%+", attenuation: "30+ dB" },
    "3g": { label: "3G (UMTS)", range: "1900-2100 MHz", effectiveness: "93%+", attenuation: "28+ dB" },
    "4g": { label: "4G (LTE)", range: "700-2600 MHz", effectiveness: "92%+", attenuation: "25+ dB" },
    "5g": { label: "5G", range: "600 MHz - 39 GHz", effectiveness: "88%+", attenuation: "22+ dB" }
  };

  // Technical specifications from LessEMF Silverell data
  const technicalSpecs = {
    material: "16% Silver/Nylon, 84% Rayon",
    construction: "Jersey Knit",
    width: "62±2 inches",
    weight: "134 g/m²",
    resistivity: "20 Ohm/Sq",
    color: "Light Gray",
    origin: "Germany",
    attenuation: "20-30 dB",
    frequency: "10 kHz to 40 GHz",
    shielding: "90%+ RF attenuation"
  };

  const features = [
    {
      icon: Shield,
      title: "EMF Protection",
      description: "Advanced electromagnetic field shielding technology blocks harmful radiation from 5G, WiFi, and cellular towers."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainably sourced materials with natural Rayon fibers and responsible silver coating processes."
    },
    {
      icon: Cog,
      title: "German Engineering",
      description: "Precision-manufactured Silverell® fabric meets the highest European standards for EMF protection."
    }
  ];

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = products?.[0]; // Get the first (EMF Hoodie) product

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "You must choose a size before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to shipping page with product details
    setLocation(`/shipping?productId=${product?.id || 1}&quantity=1&size=${selectedSize}`);
  };

  if (isLoading || !product) {
    return (
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading product...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="product" className="py-20 bg-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main product image */}
            <div className="relative group">
              <img 
                src={product.images[selectedImage]} 
                alt={`${product.name} - View ${selectedImage + 1}`}
                className="w-full h-auto rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            
            {/* Product gallery thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <img 
                  key={index}
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-opacity duration-300 ${
                    selectedImage === index ? "opacity-100 ring-2 ring-white" : "opacity-60 hover:opacity-80"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{product.name}</h2>
              <p className="text-xl text-platinum font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="bg-luxury-black p-6 rounded-lg border border-steel/30">
              <h3 className="text-xl font-semibold mb-4 text-silver">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                <div>
                  <span className="text-steel">Material:</span>
                  <span className="text-white ml-2">{product.material}</span>
                </div>
                <div>
                  <span className="text-steel">Protection:</span>
                  <span className="text-white ml-2">{product.protection}</span>
                </div>
                <div>
                  <span className="text-steel">Origin:</span>
                  <span className="text-white ml-2">{product.origin}</span>
                </div>
                <div>
                  <span className="text-steel">Effectiveness:</span>
                  <span className="text-white ml-2">{product.effectiveness}</span>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Size</h4>
              <div className="flex space-x-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-center transition-all duration-300 ${
                      selectedSize === size
                        ? "bg-white text-luxury-black border-white"
                        : "border-steel hover:bg-white hover:text-luxury-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="space-y-6">
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-serif font-bold">
                  ${(product.price / 100).toFixed(0)}
                </span>
                {product.originalPrice && (
                  <span className="text-steel line-through">
                    ${(product.originalPrice / 100).toFixed(0)}
                  </span>
                )}
              </div>
              
              <Button 
                onClick={handleBuyNow}
                className="w-full bg-white text-luxury-black py-4 text-lg font-semibold hover:bg-platinum transition-all duration-300 transform hover:scale-105"
              >
                Buy Now
              </Button>
              
              <div className="flex items-center space-x-6 text-sm text-steel">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Free worldwide shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
          Technical Specifications
        </h2>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-luxury-black border border-steel/30 mb-8">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-steel/20 data-[state=active]:text-white text-steel font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="shielding" 
              className="data-[state=active]:bg-steel/20 data-[state=active]:text-white text-steel font-medium"
            >
              Shielding Specs
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-steel/20 data-[state=active]:text-white text-steel font-medium"
            >
              Technical Details
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="data-[state=active]:bg-steel/20 data-[state=active]:text-white text-steel font-medium"
            >
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-luxury-black rounded-lg border border-steel/30">
                <h3 className="text-steel text-sm uppercase tracking-wide mb-2">Shielding</h3>
                <p className="text-white font-semibold">{technicalSpecs.shielding}</p>
              </div>
              <div className="text-center p-6 bg-luxury-black rounded-lg border border-steel/30">
                <h3 className="text-steel text-sm uppercase tracking-wide mb-2">Frequency Range</h3>
                <p className="text-white font-semibold">{technicalSpecs.frequency}</p>
              </div>
              <div className="text-center p-6 bg-luxury-black rounded-lg border border-steel/30">
                <h3 className="text-steel text-sm uppercase tracking-wide mb-2">Attenuation</h3>
                <p className="text-white font-semibold">{technicalSpecs.attenuation}</p>
              </div>
              <div className="text-center p-6 bg-luxury-black rounded-lg border border-steel/30">
                <h3 className="text-steel text-sm uppercase tracking-wide mb-2">Origin</h3>
                <p className="text-white font-semibold">{technicalSpecs.origin}</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-serif font-bold">Silverell® Fabric Technology</h3>
              <p className="text-steel max-w-3xl mx-auto leading-relaxed">
                Our ArmorRF hoodies are crafted with authentic Silverell® fabric, combining the natural softness 
                of Rayon with the conductivity of Silver. This German-engineered material provides superior EMF 
                shielding while maintaining comfort and durability for everyday wear.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="shielding" className="space-y-8">
            <InteractiveShieldingChart />
          </TabsContent>

          <TabsContent value="details" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold">Material Composition</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">Material</span>
                    <span className="text-white font-medium">{technicalSpecs.material}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">Construction</span>
                    <span className="text-white font-medium">{technicalSpecs.construction}</span>
                  </div>

                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold">Electrical Properties</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">Surface Resistivity</span>
                    <span className="text-white font-medium">{technicalSpecs.resistivity}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">Frequency Range</span>
                    <span className="text-white font-medium">{technicalSpecs.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">RF Attenuation</span>
                    <span className="text-white font-medium">{technicalSpecs.attenuation}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-steel/20">
                    <span className="text-steel">Color</span>
                    <span className="text-white font-medium">{technicalSpecs.color}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-luxury-black rounded-lg border border-steel/30 p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Cog className="w-5 h-5 mr-2 text-silver" />
                Care Instructions
              </h4>
              <ul className="text-steel space-y-2">
                <li>• Wash gently by hand or machine on delicate cycle</li>
                <li>• Use neutral detergent, avoid bleach or alkaline detergents</li>
                <li>• Water temperature below 40°C (104°F)</li>
                <li>• Hang dry promptly, avoid direct sunlight</li>
                <li>• Do not iron - maintains fabric conductivity</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-silver" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-steel">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-luxury-black rounded-lg border border-steel/30 p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-silver" />
                  Anti-Static Properties
                </h4>
                <p className="text-steel">
                  Silver content provides natural anti-static and antibacterial properties, 
                  reducing odors and maintaining freshness over extended wear.
                </p>
              </div>
              
              <div className="bg-luxury-black rounded-lg border border-steel/30 p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-silver" />
                  Grounding Capability
                </h4>
                <p className="text-steel">
                  The conductive fabric can be grounded for enhanced protection, 
                  making it suitable for both portable and stationary EMF shielding applications.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
