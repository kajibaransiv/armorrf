import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import Logo from "./logo";
import { useScrollToElement } from "@/lib/hooks";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollToElement = useScrollToElement();

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location !== "/") {
      window.location.href = "/";
      setTimeout(() => {
        scrollToElement("product");
      }, 100);
    } else {
      scrollToElement("product");
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 nav-glass border-b border-steel/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`transition-colors duration-300 font-medium ${
                isActive("/") 
                  ? "text-white" 
                  : "text-platinum hover:text-white"
              }`}
            >
              Home
            </Link>
            <button
              onClick={handleProductClick}
              className="transition-colors duration-300 font-medium text-platinum hover:text-white"
            >
              Product
            </button>
            <Link
              href="/about"
              className={`transition-colors duration-300 font-medium ${
                isActive("/about") 
                  ? "text-white" 
                  : "text-platinum hover:text-white"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition-colors duration-300 font-medium ${
                isActive("/contact") 
                  ? "text-white" 
                  : "text-platinum hover:text-white"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button className="text-platinum hover:text-white transition-colors duration-300">
              <ShoppingBag className="w-5 h-5" />
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-platinum hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-steel/20 mt-4 pt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`transition-colors duration-300 font-medium ${
                  isActive("/") 
                    ? "text-white" 
                    : "text-platinum hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={handleProductClick}
                className="transition-colors duration-300 font-medium text-platinum hover:text-white text-left"
              >
                Product
              </button>
              <Link
                href="/about"
                className={`transition-colors duration-300 font-medium ${
                  isActive("/about") 
                    ? "text-white" 
                    : "text-platinum hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`transition-colors duration-300 font-medium ${
                  isActive("/contact") 
                    ? "text-white" 
                    : "text-platinum hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
