"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HealthMetrics {
  status: "healthy" | "warning" | "critical";
  timestamp: string;
  uptime: number;
  responseTime: number;
  services: {
    database: {
      status: "healthy" | "warning" | "critical";
      responseTime: number;
      error?: string;
    };
    external: {
      [key: string]: {
        status: "healthy" | "warning" | "critical";
        responseTime: number;
        error?: string;
      };
    };
    memory: {
      used: number;
      total: number;
      external: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
  errors: number;
  version: string;
  environment: string;
}

export function ProductionDashboard() {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
        const data = await response.json();
        setHealthData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch health data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-burgundy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">Error: {error}</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const memoryUsagePercent =
    (healthData.services.memory.used / healthData.services.memory.total) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">System Health</h3>
            <Badge className={getStatusColor(healthData.status)}>
              {healthData.status.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-semibold">
                  {formatUptime(healthData.uptime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-lg font-semibold">
                  {healthData.responseTime}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Version</p>
                <p className="text-lg font-semibold">{healthData.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Environment</p>
                <p className="text-lg font-semibold capitalize">
                  {healthData.environment}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Memory Usage</p>
              <Progress value={memoryUsagePercent} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatBytes(healthData.services.memory.used)}</span>
                <span>{formatBytes(healthData.services.memory.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Database</h4>
              <Badge
                className={getStatusColor(healthData.services.database.status)}
              >
                {healthData.services.database.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600">Response Time</p>
              <p className="text-sm font-medium">
                {healthData.services.database.responseTime}ms
              </p>
              {healthData.services.database.error && (
                <p className="text-xs text-red-600 mt-1">
                  {healthData.services.database.error}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* External Services */}
        {Object.entries(healthData.services.external).map(([service, data]) => (
          <Card key={service}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium capitalize">{service}</h4>
                <Badge className={getStatusColor(data.status)}>
                  {data.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-600">Response Time</p>
                <p className="text-sm font-medium">{data.responseTime}ms</p>
                {data.error && (
                  <p className="text-xs text-red-600 mt-1">{data.error}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Error Summary */}
      {healthData.errors > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="p-6">
            <h3 className="text-yellow-800 font-semibold mb-2">
              Recent Errors
            </h3>
            <p className="text-yellow-700">
              {healthData.errors} error{healthData.errors !== 1 ? "s" : ""} in
              the last hour
            </p>
          </div>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(healthData.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
