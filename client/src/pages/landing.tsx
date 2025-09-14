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
                  onClick={() => scrollToSection('gallery')}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                  data-testid="nav-gallery"
                >
                  Gallery
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                  data-testid="nav-pricing"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                  data-testid="nav-contact"
                >
                  Contact
                </button>
                <a 
                  href="/admin"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  data-testid="nav-admin"
                >
                  Admin
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
            <div className="flex justify-center mt-8">
              <a 
                href="/admin"
                className="bg-secondary/20 hover:bg-secondary/30 text-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-secondary/30"
                data-testid="link-admin-panel"
              >
                🔧 Admin Dashboard
              </a>
            </div>
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

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Before/After Showcase</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our AI can do - Upload your photo for instant preview
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="before-after-container relative h-80 rounded-xl overflow-hidden" data-testid="before-after-1">
              <img 
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Damaged old bathtub before refinishing" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <img 
                src="https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Beautiful renovated bathtub after refinishing" 
                className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500" 
              />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                BEFORE → AFTER
              </div>
            </div>
            
            <div className="before-after-container relative h-80 rounded-xl overflow-hidden" data-testid="before-after-2">
              <img 
                src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Old shower with worn tiles before renovation" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <img 
                src="https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern renovated shower with fresh tiles" 
                className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500" 
              />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                BEFORE → AFTER
              </div>
            </div>
          </div>
          
          {/* AI Preview Demo */}
          <Card className="glass-effect rounded-xl p-8 text-center">
            <CardContent className="p-0">
              <h3 className="text-2xl font-semibold mb-6">AI Preview Demo</h3>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <i className="fas fa-camera text-2xl text-primary"></i>
                  </div>
                  <p className="font-medium">Original Photo</p>
                  <p className="text-sm text-muted-foreground">Your upload</p>
                </div>
                <div className="text-2xl text-primary">
                  <i className="fas fa-arrow-right hidden md:block"></i>
                  <i className="fas fa-arrow-down md:hidden"></i>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-secondary/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <i className="fas fa-magic text-2xl text-secondary"></i>
                  </div>
                  <p className="font-medium">AI Generated Preview</p>
                  <p className="text-sm text-muted-foreground">30 seconds later</p>
                </div>
                <div className="text-2xl text-primary">
                  <i className="fas fa-arrow-right hidden md:block"></i>
                  <i className="fas fa-arrow-down md:hidden"></i>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-accent/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <i className="fas fa-check-circle text-2xl text-accent"></i>
                  </div>
                  <p className="font-medium">Final Result</p>
                  <p className="text-sm text-muted-foreground">Actual finish</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Admin Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Administrative Access</h3>
          <Card className="glass-effect rounded-lg p-6">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input 
                  type="email" 
                  placeholder="Admin Email" 
                  className="bg-input border border-border"
                  data-testid="input-admin-email"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="bg-input border border-border"
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                variant="secondary"
                className="bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                data-testid="button-admin-access"
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
    </div>
  );
}
