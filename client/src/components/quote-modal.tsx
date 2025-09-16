import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ServiceType, Quote, AIAnalysis } from "@shared/schema";
import { Camera, Upload, Search, Clock, DollarSign, Eye } from "lucide-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTypes: ServiceType[];
}

function AIAnalysisDisplay({ analysis }: { analysis: AIAnalysis }) {
  try {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Analysis Metrics */}
        <div className="space-y-3">
          <div className="bg-background rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complexity Level:</span>
              <Badge variant={analysis.complexity > 7 ? "destructive" : analysis.complexity > 4 ? "default" : "secondary"}>
                {analysis.complexity}/10
              </Badge>
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
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="bg-background rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Price:</span>
              <span>${analysis.breakdown?.basePrice || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Complexity Adj:</span>
              <span>${(analysis.breakdown?.complexityMultiplier || 0) - (analysis.breakdown?.basePrice || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Additional Fees:</span>
              <span>${analysis.breakdown?.additionalFees || 0}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${analysis.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mt-4 md:col-span-2">
            <h5 className="font-medium mb-2">💡 Recommendations:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        Quote generated successfully
      </div>
    );
  }
}

export default function QuoteModal({ isOpen, onClose, serviceTypes }: QuoteModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    serviceTypeId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch historical quotes when searching
  const { data: historicalQuotes = [], isLoading: isLoadingHistory } = useQuery<Quote[]>({
    queryKey: ['/api/quotes/search', { email: searchEmail }],
    enabled: showHistory && searchEmail.trim().length > 0
  });

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
    
    // Validate all required fields
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

    // Create FormData for submission
    const submitData = new FormData();
    submitData.append('customerName', formData.customerName.trim());
    submitData.append('customerEmail', formData.customerEmail.trim());
    submitData.append('serviceTypeId', formData.serviceTypeId);
    submitData.append('photo', selectedFile);

    createQuoteMutation.mutate(submitData);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({ customerName: "", customerEmail: "", serviceTypeId: "" });
    setSelectedFile(null);
    setQuote(null);
    setShowHistory(false);
    setSearchEmail("");
    onClose();
  };

  const handleSearchHistory = () => {
    if (!formData.customerEmail.trim()) {
      toast({ title: "Enter your email to view quote history", variant: "destructive" });
      return;
    }
    setSearchEmail(formData.customerEmail);
    setShowHistory(true);
  };

  const selectedService = serviceTypes.find(s => s.id === formData.serviceTypeId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="quote-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Get Your AI-Powered Quote</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Upload a photo and get instant pricing with our AI assistant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Main Quote Form */}
          {!quote && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modal-customerName">Your Name *</Label>
                  <Input
                    id="modal-customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                    data-testid="modal-input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-customerEmail">Email Address *</Label>
                  <Input
                    id="modal-customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    data-testid="modal-input-customer-email"
                  />
                </div>
              </div>

              {/* Service Type Selection */}
              <div>
                <Label htmlFor="modal-serviceType">Service Type *</Label>
                <Select 
                  value={formData.serviceTypeId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceTypeId: value }))}
                >
                  <SelectTrigger data-testid="modal-select-service-type">
                    <SelectValue placeholder="What needs refinishing?" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - Starting at ${service.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Upload Photo *</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors duration-200 cursor-pointer group"
                  onClick={() => document.getElementById('modal-fileInput')?.click()}
                  data-testid="modal-file-upload-area"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Camera className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    <div>
                      <p className="text-lg font-medium">
                        {selectedFile ? selectedFile.name : "Upload Your Photo"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click to select or drag & drop (JPG, PNG up to 10MB)
                      </p>
                    </div>
                  </div>
                  <input 
                    id="modal-fileInput"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    data-testid="modal-input-file"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-semibold"
                  disabled={createQuoteMutation.isPending}
                  data-testid="modal-button-generate-quote"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {createQuoteMutation.isPending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Analyzing Photo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Generate AI Quote</span>
                      </>
                    )}
                  </div>
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleSearchHistory}
                  className="flex items-center space-x-2"
                  data-testid="modal-button-view-history"
                >
                  <Search className="w-4 h-4" />
                  <span>View Previous Quotes</span>
                </Button>
              </div>
            </form>
          )}

          {/* AI Processing Loading */}
          {createQuoteMutation.isPending && (
            <Card className="border-primary/20 bg-primary/5">
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
            <Card className="border-primary/20 bg-primary/5" data-testid="modal-quote-results">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center space-x-2">
                  <DollarSign className="w-6 h-6" />
                  <span>Your Quote Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price Display */}
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {quote.aiAnalysis ? 'AI-Calculated Price:' : 'Estimated Price:'}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {quote.aiAnalysis ? 'Based on photo analysis' : 'Base service pricing'}
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-primary" data-testid="modal-quote-price">
                      ${quote.totalPrice ? quote.totalPrice : 0}
                    </span>
                  </div>
                  
                  {/* AI Analysis Results */}
                  {quote.aiAnalysis && (
                    <div className="space-y-4">
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 text-center flex items-center justify-center space-x-2">
                          <span>🤖</span>
                          <span>AI Analysis Details</span>
                        </h4>
                        
                        <AIAnalysisDisplay analysis={quote.aiAnalysis as AIAnalysis} />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="flex-1"
                      data-testid="modal-button-schedule-consultation"
                    >
                      Schedule Free Consultation
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setQuote(null)}
                      data-testid="modal-button-new-quote"
                    >
                      Get Another Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historical Quotes Section */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Your Quote History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading your quotes...</p>
                  </div>
                ) : historicalQuotes.length > 0 ? (
                  <div className="space-y-3">
                    {historicalQuotes.slice(0, 5).map((historicalQuote, index) => (
                      <div key={historicalQuote.id} className="p-3 border rounded-lg flex justify-between items-center" data-testid={`historical-quote-${index}`}>
                        <div>
                          <div className="font-medium">{historicalQuote.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(historicalQuote.createdAt || '').toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${historicalQuote.totalPrice}</div>
                          <Badge variant="outline" className="text-xs">
                            {historicalQuote.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No previous quotes found for this email.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}