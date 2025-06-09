import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ selectedSize, amount, orderId }: { selectedSize: string; amount: number; orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?orderId=${orderId}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update order status to paid
      try {
        await apiRequest("PATCH", `/api/orders/${orderId}`, { 
          status: "paid",
          paymentDate: new Date().toISOString()
        });
        
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        
        setLocation(`/success?orderId=${orderId}`);
      } catch (err) {
        console.error("Failed to update order:", err);
        setLocation(`/success?orderId=${orderId}`);
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-charcoal p-6 rounded-lg border border-steel/30 mb-6">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-steel">Product:</span>
            <span>The EMF Hoodie</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel">Size:</span>
            <span>{selectedSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel">Quantity:</span>
            <span>1</span>
          </div>
          <div className="border-t border-steel/30 pt-2 mt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${amount}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-charcoal p-6 rounded-lg border border-steel/30">
          <PaymentElement />
        </div>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-white text-luxury-black py-4 text-lg font-semibold hover:bg-platinum transition-all duration-300 transform hover:scale-105"
        >
          {isProcessing ? "Processing..." : `Pay $${amount}`}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/product')}
          className="w-full border-steel text-steel hover:bg-steel hover:text-luxury-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Product
        </Button>
      </form>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [amount, setAmount] = useState(500);
  const [orderId, setOrderId] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    const amountParam = params.get('amount');
    const sizeParam = params.get('size');
    
    if (!orderIdParam) {
      setLocation('/product');
      return;
    }
    
    setOrderId(orderIdParam);
    if (amountParam) setAmount(parseFloat(amountParam));
    if (sizeParam) setSelectedSize(sizeParam);

    // Create PaymentIntent
    const amountInCents = Math.round((parseFloat(amountParam || '500')) * 100);
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: amountInCents,
      orderId: orderIdParam
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch(() => {
        setLocation('/product');
      });
  }, [setLocation]);

  if (!clientSecret || !orderId) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-luxury-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Secure Checkout</h1>
          <p className="text-xl text-platinum">Complete your purchase of The EMF Hoodie</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm selectedSize={selectedSize} amount={amount} orderId={orderId} />
        </Elements>
      </div>
    </div>
  );
}