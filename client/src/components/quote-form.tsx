import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ServiceType, Quote, AIAnalysis } from "@shared/schema";

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

  if (!isVisible) {
    return null;
  }

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
                        {service.name}
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
                onClick={() => {
                  if (!selectedFile) {
                    toast({ 
                      title: "Photo Required", 
                      description: "Please upload a photo to get an AI-powered quote",
                      variant: "destructive" 
                    });
                    return;
                  }
                  
                  // Show AI processing (without revealing price)
                  setQuote({ 
                    id: 'processing', 
                    totalPrice: 0,  // No price until AI completes
                    serviceTypeId: formData.serviceTypeId,
                    status: 'processing',
                    createdAt: new Date(),
                    aiAnalysis: null
                  } as Quote);
                }}
                disabled={!formData.serviceTypeId}
                data-testid="button-generate-quote"
              >
                <div className="flex items-center space-x-2">
                  <i className="fas fa-robot"></i>
                  <span>Get AI Quote</span>
                  {!selectedFile && <span className="text-xs opacity-75">(Photo Required)</span>}
                </div>
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
      
      {/* AI Processing Loading */}
      {quote?.status === 'processing' && (
        <Card className="glass-effect rounded-xl mt-8 transition-opacity duration-500">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">🤖 AI Analyzing Your Photo</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI is analyzing your bathroom to calculate a personalized quote...
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-pulse">📸</div>
                    <span>Analyzing image quality and surfaces</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-pulse">🔍</div>
                    <span>Calculating complexity and area</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-pulse">✨</div>
                    <span>Generating renovation preview</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quote Results */}
      {quote && quote.status !== 'processing' && (
        <Card className="glass-effect rounded-xl mt-8 transition-opacity duration-500" data-testid="quote-results">
          <CardHeader>
            <CardTitle className="text-center">Your Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Only show price if AI analysis is complete */}
              {quote.aiAnalysis ? (
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <span className="text-sm text-muted-foreground">AI-Calculated Price:</span>
                    <div className="text-xs text-muted-foreground">Based on photo analysis</div>
                  </div>
                  <span className="text-2xl font-bold text-primary" data-testid="quote-price">
                    ${quote.totalPrice}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
                  <span>Price:</span>
                  <span className="text-lg text-muted-foreground">Calculating with AI...</span>
                </div>
              )}
              
              {/* AI Analysis Results */}
              {quote.aiAnalysis && (
                <div className="space-y-4">
                  {(() => {
                    const analysis = quote.aiAnalysis as AIAnalysis;
                    return (
                  <div className="space-y-4">
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-3 text-center">🤖 AI Analysis</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Analysis Details */}
                        <div className="space-y-3">
                          <div className="bg-muted/20 rounded-lg p-3">
                            <div className="flex justify-between text-sm">
                              <span>Complexity Level:</span>
                              <span className="font-medium">{analysis.complexity}/10</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Surface Area:</span>
                              <span className="font-medium">{analysis.surfaceArea} sq ft</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Labor Hours:</span>
                              <span className="font-medium">{analysis.breakdown?.laborHours || 'N/A'}h</span>
                            </div>
                          </div>
                          
                          {analysis.recommendations && analysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Recommendations:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {analysis.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Generated Preview */}
                        <div className="space-y-3">
                          <div className="bg-muted/20 rounded-lg p-3 text-center">
                            <p className="text-sm font-medium mb-2">✨ Your Renovation Preview</p>
                            
                            {analysis.generatedImageUrl ? (
                              <div className="relative">
                                {analysis.generatedImageUrl.startsWith('data:text') ? (
                                  // Text description fallback
                                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl mb-2">🛁✨</div>
                                      <p className="text-xs text-muted-foreground">
                                        AI visualization generated
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  // Actual generated image
                                  <img 
                                    src={analysis.generatedImageUrl} 
                                    alt="AI-generated renovation preview"
                                    className="w-full rounded-lg"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="bg-muted/40 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">Preview generating...</p>
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground mt-2">
                              Professional refinishing result
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })()}
                </div>
              )}
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
                disabled={createQuoteMutation.isPending || !quote.aiAnalysis}
                data-testid="button-send-quote"
              >
                {createQuoteMutation.isPending ? "Sending..." : 
                 !quote.aiAnalysis ? "⏳ Waiting for AI Analysis..." :
                 "📧 Send Me My AI Quote"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
