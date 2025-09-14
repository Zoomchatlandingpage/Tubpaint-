import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AiAssistant from "@/components/ai-assistant";
import ChatModal from "@/components/chat-modal";
import QuoteForm from "@/components/quote-form";
import FloatingChatButton from "@/components/floating-chat-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ServiceType } from "@shared/schema";

export default function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ['/api/service-types']
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShowQuoteForm = () => {
    setShowQuoteForm(true);
    // Small delay to ensure component renders before scrolling
    setTimeout(() => scrollToSection('pricing'), 100);
  };

  return (
    <div className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold gradient-text">RefineAI</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                  data-testid="nav-services"
                >
                  Services
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                  data-testid="nav-pricing"
                >
                  Pricing
                </button>
                <a 
                  href="/admin"
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                  data-testid="nav-admin"
                  title="Administrative Access"
                >
                  ⚙️
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your{" "}
              <span className="gradient-text">Bathtub in 24 Hours</span>{" "}
              with AI-Powered Precision
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Upload a photo, see your preview, get instant pricing. Our AI assistant guides you through every step of your bathroom transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 group"
                onClick={handleShowQuoteForm}
                data-testid="button-upload-photo"
              >
                <i className="fas fa-camera"></i>
                <span>Upload Photo</span>
                <span className="text-sm opacity-75">Get Quote</span>
              </Button>
              <Button 
                variant="outline"
                className="glass-effect hover:bg-white/10 text-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 group"
                onClick={() => setIsChatOpen(true)}
                data-testid="button-chat-ai"
              >
                <i className="fas fa-robot"></i>
                <span>Chat with AI</span>
                <span className="text-sm opacity-75">Design Helper</span>
              </Button>
            </div>
            {/* Trust Signals */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-alt text-secondary"></i>
                <span className="text-sm">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-money-bill-wave text-secondary"></i>
                <span className="text-sm">Money Back Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-secondary"></i>
                <span className="text-sm">24 Hour Service</span>
              </div>
            </div>
          </div>
          
          {/* AI Assistant */}
          <AiAssistant onChatClick={() => setIsChatOpen(true)} />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What We Do</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional restoration services with AI precision
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {serviceTypes.slice(0, 3).map((service, index) => {
              const icons = ["🛁", "🚿", "🏺"];
              const descriptions = [
                "Like new in 24 hours",
                "Non-slip surfaces", 
                "Any color you want"
              ];
              
              return (
                <Card key={service.id} className="service-card glass-effect rounded-xl p-8 text-center group" data-testid={`service-card-${index}`}>
                  <CardContent className="p-0">
                    <div className="text-4xl mb-4">{icons[index]}</div>
                    <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">{descriptions[index]}</p>
                    <div className="text-sm text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Professional restoration
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <QuoteForm serviceTypes={serviceTypes} isVisible={showQuoteForm} />
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Get Started Today</h2>
          <p className="text-xl text-muted-foreground mb-12">Ready to transform your space?</p>
          
          <Card className="glass-effect rounded-xl p-8 mb-8">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>
                <div>
                  <div className="text-3xl mb-4">📧</div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">hello@refineai.com</p>
                </div>
                <div>
                  <div className="text-3xl mb-4">📍</div>
                  <h3 className="font-semibold mb-2">Service Area</h3>
                  <p className="text-muted-foreground">Serving Your City</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            data-testid="button-schedule-consultation"
          >
            Schedule Free Consultation
          </Button>
        </div>
      </section>


      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
    </div>
  );
}
