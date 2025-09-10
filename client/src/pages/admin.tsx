import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ServiceType, Quote, AdminConfig } from "@shared/schema";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ['/api/admin/quotes'],
    enabled: isAuthenticated
  });

  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ['/api/admin/service-types'],
    enabled: isAuthenticated
  });

  const { data: config } = useQuery<AdminConfig>({
    queryKey: ['/api/admin/config'],
    enabled: isAuthenticated
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/login', credentials);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<AdminConfig>) => {
      const response = await apiRequest('PUT', '/api/admin/config', config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({ title: "Configuration updated successfully" });
    }
  });

  const updateServiceTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceType> }) => {
      const response = await apiRequest('PUT', `/api/admin/service-types/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-types'] });
      toast({ title: "Service type updated successfully" });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleConfigUpdate = (field: string, value: string) => {
    if (!config) return;
    updateConfigMutation.mutate({ ...config, [field]: value });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  data-testid="input-admin-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">RefineAI Admin</h1>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quotes" data-testid="tab-quotes">Quotes</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">Configuration</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id} data-testid={`quote-row-${quote.id}`}>
                        <TableCell>{quote.customerName || quote.customerEmail}</TableCell>
                        <TableCell>{quote.serviceTypeId}</TableCell>
                        <TableCell>${quote.totalPrice}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quote.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(quote.createdAt!).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Service Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceTypes.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`service-type-${service.id}`}>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-muted-foreground">Base Price: ${service.basePrice}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={service.basePrice}
                          onChange={(e) => updateServiceTypeMutation.mutate({
                            id: service.id,
                            data: { basePrice: parseInt(e.target.value) }
                          })}
                          className="w-24"
                          data-testid={`input-price-${service.id}`}
                        />
                        <span>$</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="llmProvider">LLM Provider</Label>
                    <Select value={config?.llmProvider || 'openai'} onValueChange={(value) => handleConfigUpdate('llmProvider', value)}>
                      <SelectTrigger data-testid="select-llm-provider">
                        <SelectValue placeholder="Select LLM Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="llmApiKey">API Key</Label>
                    <Input
                      id="llmApiKey"
                      type="password"
                      value={config?.llmApiKey || ""}
                      onChange={(e) => handleConfigUpdate('llmApiKey', e.target.value)}
                      placeholder="Enter API Key"
                      data-testid="input-api-key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assistantPrompt">Assistant Prompt</Label>
                    <Textarea
                      id="assistantPrompt"
                      value={config?.assistantPrompt || ""}
                      onChange={(e) => handleConfigUpdate('assistantPrompt', e.target.value)}
                      placeholder="Enter assistant prompt..."
                      rows={4}
                      data-testid="textarea-assistant-prompt"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhookUrl">n8n Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={config?.webhookUrl || ""}
                      onChange={(e) => handleConfigUpdate('webhookUrl', e.target.value)}
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      data-testid="input-webhook-url"
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Webhook Events</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• New quote submissions</li>
                      <li>• Photo analysis requests</li>
                      <li>• Chat interactions</li>
                      <li>• Quote status updates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="metric-total-quotes">{quotes.length}</div>
                  <p className="text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="metric-pending-quotes">
                    {quotes.filter(q => q.status === 'pending').length}
                  </div>
                  <p className="text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Quote Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="metric-avg-quote">
                    ${quotes.length > 0 ? Math.round(quotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0) / quotes.length) : 0}
                  </div>
                  <p className="text-muted-foreground">Per quote</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
