import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContactMessage, InsertNewsletterSubscription } from "@shared/schema";

export default function Contact() {
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you within 24 hours.",
      });
      setContactForm({ firstName: "", lastName: "", email: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const newsletterMutation = useMutation({
    mutationFn: async (data: InsertNewsletterSubscription) => {
      return apiRequest("POST", "/api/newsletter", data);
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed",
        description: "Welcome to the ArmorRF community!",
      });
      setNewsletterEmail("");
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "Please check your email and try again.",
        variant: "destructive",
      });
    }
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email || !contactForm.message) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to send your message.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(contactForm);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast({
        title: "Please enter your email",
        description: "Email address is required for newsletter subscription.",
        variant: "destructive",
      });
      return;
    }
    newsletterMutation.mutate({ email: newsletterEmail });
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-platinum max-w-2xl mx-auto">
              Have questions about EMF protection or need assistance with your order? 
              We're here to help you navigate the future of wearable wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-charcoal border-steel/30 text-white placeholder-steel focus:border-silver"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="bg-charcoal border-steel/30 text-white placeholder-steel focus:border-silver"
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-charcoal border-steel/30 text-white placeholder-steel focus:border-silver"
                  required
                />
                <Textarea
                  placeholder="Your Message"
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-charcoal border-steel/30 text-white placeholder-steel focus:border-silver resize-none"
                  required
                />
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-white text-luxury-black py-3 font-semibold hover:bg-platinum transition-all duration-300 transform hover:scale-105"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information & Newsletter */}
            <div className="space-y-8">
              
              {/* Contact Info */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4 text-platinum">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-silver" />
                    <span>hello@armorf.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-silver" />
                    <span>Toronto, Canada</span>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-charcoal p-6 rounded-lg border border-steel/30">
                <h4 className="text-xl font-semibold mb-4">Stay Protected</h4>
                <p className="text-steel mb-6">
                  Subscribe to receive updates on EMF research, new products, and exclusive offers.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-luxury-black border-steel/30 text-white placeholder-steel focus:border-silver"
                  />
                  <Button
                    type="submit"
                    disabled={newsletterMutation.isPending}
                    className="bg-silver text-luxury-black px-6 py-3 font-semibold hover:bg-white transition-colors duration-300"
                  >
                    {newsletterMutation.isPending ? "..." : "Subscribe"}
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-steel/20 rounded-full flex items-center justify-center text-silver hover:bg-silver hover:text-luxury-black transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-steel/20 rounded-full flex items-center justify-center text-silver hover:bg-silver hover:text-luxury-black transition-all duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-steel/20 rounded-full flex items-center justify-center text-silver hover:bg-silver hover:text-luxury-black transition-all duration-300"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
