import { useScrollToElement } from "@/lib/hooks";
import HeroSection from "@/components/hero-section";
import ProductShowcase from "@/components/product-showcase";
import TechnologySection from "@/components/technology-section";

export default function Home() {
  const scrollToElement = useScrollToElement();

  const handleScrollToProduct = () => {
    scrollToElement("product");
  };

  return (
    <div className="pt-16">
      <HeroSection onScrollToProduct={handleScrollToProduct} />
      <ProductShowcase />
      <TechnologySection />
    </div>
  );
}
