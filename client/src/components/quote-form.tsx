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
      
      <div className="max-w-2xl mx-auto">
        {/* Quote Form */}
        <Card className="glass-effect rounded-xl">
          <CardHeader>
            <div className="text-center">
              <div className="text-4xl mb-4">📸</div>
              <CardTitle className="text-xl mb-2">Get Your Quote</CardTitle>
              <p className="text-muted-foreground">Upload photo for instant AI pricing</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Customer Info - FIRST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="bg-input border border-border"
                    placeholder="Enter your full name"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="bg-input border border-border"
                    placeholder="your@email.com"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
              </div>
              
              {/* Service Type */}
              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select 
                  value={formData.serviceTypeId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceTypeId: value }))}
                >
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue placeholder="What needs refinishing?" />
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

              {/* Photo Upload */}
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors duration-200 cursor-pointer group"
                onClick={() => document.getElementById('fileInput')?.click()}
                data-testid="file-upload-area"
              >
                <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground group-hover:text-primary transition-colors duration-200 mb-3"></i>
                <p className="text-lg font-medium mb-2">
                  {selectedFile ? selectedFile.name : "Upload Your Photo"}
                </p>
                <p className="text-sm text-muted-foreground">Click to select or drag & drop (JPG, PNG up to 10MB)</p>
                <input 
                  id="fileInput"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  data-testid="input-file"
                />
              </div>
              
              {/* Generate Quote Button */}
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold"
                onClick={() => {
                  // Validate customer info FIRST
                  if (!formData.customerName.trim()) {
                    toast({ title: "Please enter your name", variant: "destructive" });
                    return;
                  }
                  
                  if (!formData.customerEmail.trim()) {
                    toast({ title: "Please enter your email address", variant: "destructive" });
                    return;
                  }
                  
                  if (!formData.serviceTypeId) {
                    toast({ title: "Please select a service type", variant: "destructive" });
                    return;
                  }
                  
                  if (!selectedFile) {
                    toast({ 
                      title: "Photo Required", 
                      description: "Please upload a photo to get an AI-powered quote",
                      variant: "destructive" 
                    });
                    return;
                  }

                  // Create FormData with required info
                  const submitData = new FormData();
                  submitData.append('customerName', formData.customerName.trim());
                  submitData.append('customerEmail', formData.customerEmail.trim());
                  submitData.append('serviceTypeId', formData.serviceTypeId);
                  submitData.append('photo', selectedFile);

                  createQuoteMutation.mutate(submitData);
                }}
                disabled={createQuoteMutation.isPending}
                data-testid="button-generate-quote"
              >
                <div className="flex items-center justify-center space-x-2">
                  {createQuoteMutation.isPending ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Analyzing Photo...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      <span>Generate AI Quote</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Processing Loading */}
      {createQuoteMutation.isPending && (
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
      {quote && !createQuoteMutation.isPending && (
        <Card className="glass-effect rounded-xl mt-8 transition-opacity duration-500" data-testid="quote-results">
          <CardHeader>
            <CardTitle className="text-center">Your Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Always show price */}
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {String(quote.aiAnalysis ? 'AI-Calculated Price:' : 'Estimated Price:')}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {String(quote.aiAnalysis ? 'Based on photo analysis' : 'Base service pricing')}
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary" data-testid="quote-price">
                  ${typeof quote.totalPrice === 'number' ? quote.totalPrice : 0}
                </span>
              </div>
              
              {/* AI Analysis Results */}
              {quote.aiAnalysis && (
                <div className="space-y-4">
                  {(() => {
                    try {
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
                    } catch (error) {
                      return <div className="text-sm text-muted-foreground">AI analysis data unavailable</div>;
                    }
                  })()}
                </div>
              )}
              {/* Success message */}
              <div className="text-center p-6 bg-secondary/10 rounded-lg border border-secondary/20">
                <div className="flex items-center justify-center mb-4">
                  <i className="fas fa-check-circle text-secondary text-3xl mr-3"></i>
                  <h3 className="text-xl font-semibold">Quote Generated!</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Your personalized quote for <strong>{formData.customerName}</strong> has been created.
                </p>
                <p className="text-sm text-muted-foreground">
                  We've saved your quote and will send you a detailed report at <strong>{formData.customerEmail}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
