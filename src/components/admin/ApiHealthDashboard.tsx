import { useState, useEffect } from 'react';
import { useApiProxy } from '@/hooks/useApiProxy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logger from '@/lib/logger';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Shield,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface HealthSummary {
  service_name: string;
  is_enabled: boolean;
  uptime_percentage: number;
  avg_response_time_ms: number;
  total_requests_24h: number;
  last_check: string | null;
  current_status: boolean;
}

interface SecretsStatus {
  service_name: string;
  is_enabled: boolean;
  secret_name: string;
  has_secret: boolean;
  is_required: boolean;
}

const ApiHealthDashboard = () => {
  const { getHealthStatus, getSecretsStatus, testApiKey, loading } = useApiProxy();
  const [healthData, setHealthData] = useState<{
    health_checks: any[];
    summary: HealthSummary[];
  } | null>(null);
  const [secretsData, setSecretsData] = useState<{
    secrets_status: SecretsStatus[];
    instructions: Record<string, string>;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [healthResponse, secretsResponse] = await Promise.all([
        getHealthStatus(),
        getSecretsStatus()
      ]);
      
      setHealthData(healthResponse);
      setSecretsData(secretsResponse);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTestApiKey = async (service: string) => {
    try {
      const result = await testApiKey(service);
      logger.debug('API key test result:', result);
      // Refresh data after test
      await fetchData();
    } catch (error) {
      console.error('API key test failed:', error);
    }
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-success' : 'text-destructive';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-success';
    if (uptime >= 95) return 'text-warning';
    return 'text-destructive';
  };

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading API health dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">API Health Dashboard</h2>
          <p className="text-muted-foreground">Monitor API services, rate limits, and configurations</p>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData?.summary?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              API integrations configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {healthData?.summary?.filter(s => s.current_status).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.summary?.length ? 
                Math.round(
                  healthData.summary.reduce((sum, s) => sum + s.avg_response_time_ms, 0) / 
                  healthData.summary.length
                ) : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys Configured</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {secretsData?.secrets_status?.filter(s => s.has_secret).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Of {secretsData?.secrets_status?.filter(s => s.is_required).length || 0} required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Services Status
          </CardTitle>
          <CardDescription>
            Real-time health monitoring and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthData?.summary?.map((service) => {
            const secretInfo = secretsData?.secrets_status?.find(
              s => s.service_name === service.service_name
            );
            
            return (
              <div key={service.service_name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {service.current_status ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium capitalize">{service.service_name}</span>
                    </div>
                    <Badge variant={service.is_enabled ? "default" : "secondary"}>
                      {service.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {secretInfo && (
                      <Badge variant={secretInfo.has_secret ? "default" : "destructive"}>
                        {secretInfo.has_secret ? "API Key Set" : "No API Key"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className={`font-semibold ${getUptimeColor(service.uptime_percentage)}`}>
                        {service.uptime_percentage}%
                      </div>
                      <div className="text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{service.avg_response_time_ms}ms</div>
                      <div className="text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{service.total_requests_24h}</div>
                      <div className="text-muted-foreground">24h Requests</div>
                    </div>
                    {secretInfo && !secretInfo.has_secret && secretInfo.is_required && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestApiKey(service.service_name)}
                      >
                        Test API Key
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* API Key Configuration */}
      {secretsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Key Configuration
            </CardTitle>
            <CardDescription>
              Manage API keys for external service integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {secretsData.secrets_status.some(s => !s.has_secret && s.is_required) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some required API keys are missing. Add them to enable full functionality.
                </AlertDescription>
              </Alert>
            )}
            
            {secretsData.secrets_status.map((secret) => (
              <div key={secret.service_name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{secret.service_name}</span>
                    <Badge variant={secret.has_secret ? "default" : "secondary"}>
                      {secret.has_secret ? "Configured" : "Not Set"}
                    </Badge>
                    {!secret.is_required && (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {secretsData.instructions[secret.service_name]}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {secret.has_secret ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestApiKey(secret.service_name)}
                    >
                      Test
                    </Button>
                  ) : secret.is_required ? (
                    <Badge variant="destructive">Required</Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiHealthDashboard;