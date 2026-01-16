import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import QuoteModal from "@/components/quote-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceType } from "@shared/schema";
import { Camera, Clock, DollarSign, Shield, Star, CheckCircle, ArrowRight } from "lucide-react";

type PageVariant = "default" | "price" | "before-after" | "speed";

export default function LandingPage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const searchString = useSearch();

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ['/api/service-types']
  });

  const variant = useMemo<PageVariant>(() => {
    const params = new URLSearchParams(searchString);
    const v = params.get("variant");
    if (v && ["price", "before-after", "speed"].includes(v)) {
      return v as PageVariant;
    }
    return "default";
  }, [searchString]);

  const getHeroContent = () => {
    switch (variant) {
      case "price":
        return {
          headline: "New Bathtub Look for",
          highlight: "Under $500",
          subheadline: "Why spend $3,000+ replacing when you can refinish for a fraction of the cost?",
          cta: "Get Your Free Quote"
        };
      case "before-after":
        return {
          headline: "From Old to",
          highlight: "Like New",
          subheadline: "See the incredible transformation. Your bathtub can look brand new in just one day.",
          cta: "See Your Transformation"
        };
      case "speed":
        return {
          headline: "Done in",
          highlight: "24 Hours",
          subheadline: "Wake up to a brand new bathtub. Quick, professional, mess-free refinishing.",
          cta: "Schedule Now"
        };
      default:
        return {
          headline: "Beautiful Bathtub.",
          highlight: "Affordable Price.",
          subheadline: "Professional refinishing that looks amazing. Upload a photo, get an instant AI quote.",
          cta: "Get Instant Quote"
        };
    }
  };

  const heroContent = getHeroContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Simple Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            Refine<span className="text-blue-600">AI</span>
          </h1>
          <a 
            href="/admin" 
            className="text-xs text-slate-400 hover:text-slate-600"
            title="Admin"
          >
            ⚙️
          </a>
        </div>
      </header>

      {/* Hero Section - Simple & Direct */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            {heroContent.headline}{" "}
            <span className="text-blue-600">{heroContent.highlight}</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            {heroContent.subheadline}
          </p>

          <Button 
            size="lg"
            onClick={() => setIsQuoteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            data-testid="hero-cta-button"
          >
            <Camera className="w-5 h-5 mr-2" />
            {heroContent.cta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-slate-500 mt-4">
            📸 Upload a photo • ⚡ Get instant AI quote • 📅 Schedule your visit
          </p>
        </div>
      </section>

      {/* 3 Simple Benefits */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Save 80%</h3>
                <p className="text-slate-600 text-sm">
                  Refinishing costs a fraction of replacement. Same beautiful result.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Done in 1 Day</h3>
                <p className="text-slate-600 text-sm">
                  Quick professional service. Your bathroom ready the next morning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">5-Year Warranty</h3>
                <p className="text-slate-600 text-sm">
                  Professional quality backed by our satisfaction guarantee.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Get Your Quote in 60 Seconds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">📸 Take a Photo</h3>
              <p className="text-slate-600 text-sm">Snap a quick photo of your bathtub or shower</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">🤖 AI Analyzes</h3>
              <p className="text-slate-600 text-sm">Our AI calculates your exact price instantly</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">📅 Schedule Visit</h3>
              <p className="text-slate-600 text-sm">Book your free in-home consultation</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => setIsQuoteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl"
              data-testid="steps-cta-button"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start My Free Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      {serviceTypes.length > 0 && (
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              What We Refinish
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceTypes.map((service) => (
                <Card 
                  key={service.id} 
                  className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">
                      {service.name.toLowerCase().includes('bathtub') ? '🛁' :
                       service.name.toLowerCase().includes('shower') ? '🚿' :
                       service.name.toLowerCase().includes('tile') ? '🏺' :
                       service.name.toLowerCase().includes('counter') ? '🪞' : '✨'}
                    </div>
                    <h3 className="font-medium text-slate-900 text-sm">{service.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Licensed & Insured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">5-Star Rated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for a Beautiful Bathroom?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of happy customers. Get your free quote now.
          </p>
          <Button 
            size="lg"
            onClick={() => setIsQuoteModalOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-xl"
            data-testid="final-cta-button"
          >
            <Camera className="w-5 h-5 mr-2" />
            Get My Free Quote Now
          </Button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            © 2025 RefineAI. Professional Bathroom Refinishing.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            📞 (555) 123-4567 • 📧 hello@refineai.com
          </p>
        </div>
      </footer>

      {/* Quote Modal */}
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)}
        serviceTypes={serviceTypes}
      />
    </div>
  );
}
