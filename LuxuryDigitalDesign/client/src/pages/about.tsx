export default function About() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Our Mission</h1>
            <p className="text-xl md:text-2xl text-platinum leading-relaxed">
              A movement to shield the human nervous system from urban EMF pollution
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">The ArmorRF Story</h2>
                <p className="text-xl text-platinum leading-relaxed mb-6">
                  ArmorRF was born from a simple realization: in our hyper-connected world, 
                  we've surrounded ourselves with invisible threats that our bodies were never 
                  designed to handle.
                </p>
                <p className="text-lg text-steel leading-relaxed">
                  We believe that protection shouldn't come at the cost of style. Every ArmorRF 
                  piece represents a movement to shield the human nervous system from urban EMF 
                  pollution, while maintaining the aesthetic standards of luxury fashion.
                </p>
              </div>


            </div>

            {/* Image */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=1200" 
                alt="ArmorRF Design Process" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Overlay Stats */}
              <div className="absolute bottom-6 left-6 right-6 bg-luxury-black/80 backdrop-blur-luxury p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-silver">99.9%</div>
                    <div className="text-xs text-steel">EMF Blocking</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-silver">100%</div>
                    <div className="text-xs text-steel">Organic Cotton</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-silver">0</div>
                    <div className="text-xs text-steel">Carbon Footprint</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-20 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
              Sustainable Luxury
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold">Organic Materials</h3>
                <p className="text-steel">
                  Every hoodie is crafted using sustainably sourced organic cotton from certified suppliers.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-semibold">Zero Waste</h3>
                <p className="text-steel">
                  Our packaging is 100% recyclable, and we offset the carbon footprint of every shipment.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-steel/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏭</span>
                </div>
                <h3 className="text-xl font-semibold">Ethical Production</h3>
                <p className="text-steel">
                  Produced in certified facilities that meet the highest environmental and labor standards.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-platinum leading-relaxed">
                Every ArmorRF purchase contributes to a future where technology and nature coexist in harmony. 
                We're not just protecting you from EMF—we're protecting the planet for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
