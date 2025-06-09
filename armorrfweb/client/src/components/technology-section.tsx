import { Shield, Leaf, Cog } from "lucide-react";

export default function TechnologySection() {
  const features = [
    {
      icon: Shield,
      title: "EMF Shielding",
      description: "Blocks 99.9% of electromagnetic radiation from 5G towers, WiFi networks, and mobile devices."
    },
    {
      icon: Leaf,
      title: "Organic Materials",
      description: "Crafted from 100% certified organic cotton, ensuring comfort and sustainability."
    },
    {
      icon: Cog,
      title: "German Engineering",
      description: "Precision-knitted Silverell® fibers maintain their protective properties with proper hand-washing care."
    }
  ];

  return (
    <section className="relative py-20 bg-luxury-black overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
          style={{ transform: 'scale(1.2)' }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        >
          <source src="/attached_assets/Video_Ready_Toronto_EMF_Film_1749360255992.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-luxury-black/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Advanced Protection Technology</h2>
          <p className="text-xl text-platinum max-w-3xl mx-auto">
            Silverell® represents the pinnacle of EMF protection technology, integrating pure silver fibers 
            into organic cotton through German precision engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="text-center space-y-4 p-6 border border-steel/30 rounded-lg hover:border-silver/50 transition-colors duration-300 bg-luxury-black/60 backdrop-blur-sm"
              >
                <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-silver" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-platinum">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
