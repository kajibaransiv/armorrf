import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Package, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { Order } from '@shared/schema';

export default function Success() {
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Get order ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    
    // Clear any cart data if applicable
    localStorage.removeItem('armorf-session-id');
  }, []);

  const { data: order } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
  });

  return (
    <div className="pt-16 min-h-screen bg-luxury-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Payment Successful!</h1>
          <p className="text-xl text-platinum mb-6 max-w-2xl mx-auto">
            Thank you for your purchase of The EMF Hoodie. Your payment has been processed successfully.
          </p>
          
          {order && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2 text-white">Order Details</h3>
              <p className="text-gray-300">Order Number: <span className="text-white font-mono">{(order as Order).orderNumber}</span></p>
              <p className="text-gray-300">Total: <span className="text-white">${((order as Order).totalAmount / 100).toFixed(2)}</span></p>
              <p className="text-gray-400 text-sm mt-2">A confirmation email has been sent to {(order as Order).shippingEmail}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-silver" />
              </div>
              <h3 className="text-xl font-semibold">Email Confirmation</h3>
              <p className="text-steel">
                Order details and tracking information will be sent to your email address.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-silver" />
              </div>
              <h3 className="text-xl font-semibold">Processing</h3>
              <p className="text-steel">
                Your hoodie will be carefully prepared and shipped within 2-3 business days.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold">Free Shipping</h3>
              <p className="text-steel">
                Worldwide delivery with tracking included at no extra cost.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button className="bg-white text-luxury-black px-8 py-3 text-lg font-semibold hover:bg-platinum transition-all duration-300 transform hover:scale-105">
                Return to Home
              </Button>
            </Link>
            
            <div className="text-steel space-y-2">
              <p>Need to make changes to your order? <Link href="/"><span className="text-silver hover:text-white cursor-pointer">Use our live chat</span></Link> for immediate assistance.</p>
              <p>For other inquiries: <a href="mailto:hello@armorf.com" className="text-silver hover:text-white">hello@armorf.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}