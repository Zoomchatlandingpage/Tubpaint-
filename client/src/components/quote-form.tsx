import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ServiceType, Quote } from "@shared/schema";

interface QuoteFormProps {
  serviceTypes: ServiceType[];
  isVisible: boolean;
}

export default function QuoteForm({ serviceTypes, isVisible }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    serviceTypeId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createQuoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to create quote');
      return response.json();
    },
    onSuccess: (newQuote) => {
      setQuote(newQuote);
      toast({ title: "Quote generated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to generate quote", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceTypeId) {
      toast({ title: "Please select a service type", variant: "destructive" });
      return;
    }

    const submitData = new FormData();
    submitData.append('customerName', formData.customerName);
    submitData.append('customerEmail', formData.customerEmail);
    submitData.append('serviceTypeId', formData.serviceTypeId);
    
    if (selectedFile) {
      submitData.append('photo', selectedFile);
    }

    createQuoteMutation.mutate(submitData);
  };

  const selectedService = serviceTypes.find(s => s.id === formData.serviceTypeId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Your Quote</h2>
        <p className="text-xl text-muted-foreground">
          Upload your photo or chat with our AI for instant pricing
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Photo Upload */}
        <Card className="glass-effect rounded-xl">
          <CardHeader>
            <div className="text-center">
              <div className="text-4xl mb-4">📸</div>
              <CardTitle className="text-xl mb-2">Upload Your Photo</CardTitle>
              <p className="text-muted-foreground">Get instant AI analysis</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={formData.serviceTypeId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceTypeId: value }))}
                >
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors duration-200 cursor-pointer group"
                onClick={() => document.getElementById('fileInput')?.click()}
                data-testid="file-upload-area"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-4"></i>
                <p className="text-lg font-medium mb-2">
                  {selectedFile ? selectedFile.name : "Drag & Drop or Click to Upload"}
                </p>
                <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                <input 
                  id="fileInput"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  data-testid="input-file"
                />
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 font-semibold"
                onClick={() => setQuote({ 
                  id: 'preview', 
                  totalPrice: selectedService?.basePrice || 0,
                  serviceTypeId: formData.serviceTypeId,
                  status: 'preview',
                  createdAt: new Date()
                } as Quote)}
                disabled={!formData.serviceTypeId}
                data-testid="button-generate-quote"
              >
                Generate Quote Preview
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Chat Option */}
        <Card className="glass-effect rounded-xl">
          <CardHeader>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <CardTitle className="text-xl mb-2">Chat with AI</CardTitle>
              <p className="text-muted-foreground">Personalized assistance</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-6 mb-6 h-48 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-xs text-primary-foreground"></i>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 flex-1">
                    <p className="text-sm">Hi! I can help you design your dream bathtub. Want to see what it would look like?</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-input border border-border text-sm"
                data-testid="input-chat"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quote Results */}
      {quote && (
        <Card className="glass-effect rounded-xl mt-8 transition-opacity duration-500" data-testid="quote-results">
          <CardHeader>
            <CardTitle className="text-center">Your Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
                <span>Estimated Price:</span>
                <span className="text-2xl font-bold text-primary" data-testid="quote-price">
                  ${quote.totalPrice}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Your Name</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="bg-input border border-border"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="bg-input border border-border"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
              </div>
              <Button 
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 font-semibold"
                disabled={createQuoteMutation.isPending}
                data-testid="button-send-quote"
              >
                {createQuoteMutation.isPending ? "Sending..." : "📧 Send Me My Quote"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
