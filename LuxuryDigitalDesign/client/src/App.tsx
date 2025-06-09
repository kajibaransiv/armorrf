import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CustomerChat from "@/components/customer-chat";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import ProductPage from "@/pages/product";
import Shipping from "@/pages/shipping";
import Checkout from "@/pages/checkout";
import Success from "@/pages/success";
import WatermarkTool from "@/pages/watermark-tool";
import AdminDashboard from "@/pages/admin-fixed";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/product" component={ProductPage} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      <Route path="/watermark-tool" component={WatermarkTool} />
      <Route path="/admin" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-luxury-black text-white">
          <Navigation />
          <main>
            <Router />
          </main>
          <Footer />
          <CustomerChat />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
