import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSessionId } from "@/lib/hooks";
import type { Product, InsertOrder } from "@shared/schema";

const shippingSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  size: z.string().min(1, "Size is required"),
  shippingFirstName: z.string().min(1, "First name is required"),
  shippingLastName: z.string().min(1, "Last name is required"),
  shippingEmail: z.string().email("Valid email is required"),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingZip: z.string().min(1, "ZIP code is required"),
  shippingCountry: z.string().min(1, "Country is required"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function Shipping() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const sessionId = useSessionId();
  
  // Get product and order details from URL params or state
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('productId') || '1');
  const quantity = parseInt(urlParams.get('quantity') || '1');
  const size = urlParams.get('size') || '';

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const product = products?.find(p => p.id === productId);
  const totalAmount = product ? (product.price / 100) * quantity : 0;

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      productId,
      quantity,
      size,
      shippingFirstName: "",
      shippingLastName: "",
      shippingEmail: "",
      shippingPhone: "",
      shippingAddress: "",
      shippingAddress2: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      shippingCountry: "United States",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Proceeding to Payment",
        description: "Redirecting to secure payment...",
      });
      // Redirect to checkout with order details
      setLocation(`/checkout?orderId=${order.id}&amount=${totalAmount}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShippingFormData) => {
    const orderData: InsertOrder = {
      ...data,
      sessionId,
      productId: productId || 1,
      quantity: quantity || 1,
      size: size || 'M',
      totalAmount: Math.round(totalAmount * 100), // Convert dollars to cents
      status: "pending",
    };
    
    createOrderMutation.mutate(orderData);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => setLocation('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-gray-400">Size: {size}</p>
                    <p className="text-gray-400">Quantity: {quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="text-white">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Shipping:</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg border-t border-gray-600 pt-2 mt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-white">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Form */}
          <div>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shippingEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-gray-800 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" className="bg-gray-800 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Address</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">City</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">State</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/product')}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Back to Product
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createOrderMutation.isPending}
                        className="flex-1 bg-white text-black hover:bg-gray-100"
                      >
                        {createOrderMutation.isPending ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}