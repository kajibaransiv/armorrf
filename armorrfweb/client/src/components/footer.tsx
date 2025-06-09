import { Link } from "wouter";
import Logo from "./logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal border-t border-steel/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Logo className="text-2xl mb-4" />
            <p className="text-steel leading-relaxed max-w-md">
              Pioneering the future of wearable EMF protection through German engineering 
              and sustainable luxury fashion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <div className="space-y-2 text-steel">
              <Link href="/" className="block hover:text-white transition-colors duration-300">
                Home
              </Link>
              <Link href="/product" className="block hover:text-white transition-colors duration-300">
                Product
              </Link>
              <Link href="/about" className="block hover:text-white transition-colors duration-300">
                About
              </Link>
              <Link href="/contact" className="block hover:text-white transition-colors duration-300">
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <div className="space-y-2 text-steel">
              <a href="#" className="block hover:text-white transition-colors duration-300">
                Size Guide
              </a>
              <a href="#" className="block hover:text-white transition-colors duration-300">
                Care Instructions
              </a>
              <a href="#" className="block hover:text-white transition-colors duration-300">
                Returns
              </a>
              <a href="#" className="block hover:text-white transition-colors duration-300">
                EMF Testing
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-steel/30 mt-12 pt-8 text-center text-steel">
          <p>&copy; {currentYear} ArmorRF. All rights reserved. | Designed for the future of wearable protection.</p>
        </div>
      </div>
    </footer>
  );
}
