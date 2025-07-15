'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Users, DollarSign, Target, Mail, MessageSquare } from 'lucide-react';

interface ROIMetrics {
  timeSaved: {
    weekly: number;
    monthly: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    breakdown: {
      emailProcessing: number;
      meetingPrep: number;
      prioritization: number;
      drafting: number;
    };
  };
  productivity: {
    emailResponseTime: number;
    averageResponseTime: number;
    processingSpeed: number;
    tasksCompleted: number;
  };
  nps: {
    score: number;
    responses: number;
    trend: 'up' | 'down' | 'stable';
    segments: {
      promoters: number;
      passives: number;
      detractors: number;
    };
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    sessionsPerUser: number;
    avgSessionDuration: number;
  };
  costSavings: {
    hourlyRate: number;
    monthlySavings: number;
    annualProjection: number;
    roi: number;
  };
}

export function ROIDashboard() {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchROIMetrics = async () => {
      try {
        // Mock data for demo - in production this would come from analytics API
        const mockMetrics: ROIMetrics = {
          timeSaved: {
            weekly: 12.5,
            monthly: 50,
            target: 10,
            trend: 'up',
            breakdown: {
              emailProcessing: 6.5,
              meetingPrep: 3.0,
              prioritization: 2.0,
              drafting: 1.0
            }
          },
          productivity: {
            emailResponseTime: 45,
            averageResponseTime: 120,
            processingSpeed: 85,
            tasksCompleted: 142
          },
          nps: {
            score: 67,
            responses: 89,
            trend: 'up',
            segments: {
              promoters: 65,
              passives: 24,
              detractors: 11
            }
          },
          engagement: {
            dailyActiveUsers: 234,
            weeklyActiveUsers: 567,
            sessionsPerUser: 4.2,
            avgSessionDuration: 18
          },
          costSavings: {
            hourlyRate: 150,
            monthlySavings: 7500,
            annualProjection: 90000,
            roi: 340
          }
        };

        setMetrics(mockMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ROI metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchROIMetrics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchROIMetrics, 300000);
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

  if (!metrics) {
    return null;
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>;
    }
  };

  const getNPSColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const timeSavedPercent = (metrics.timeSaved.weekly / metrics.timeSaved.target) * 100;
  const npsPercent = (metrics.nps.score / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-brand-burgundy/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-burgundy" />
                <h3 className="text-sm font-medium">Time Saved This Week</h3>
              </div>
              {getTrendIcon(metrics.timeSaved.trend)}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-brand-burgundy">
                  {formatHours(metrics.timeSaved.weekly)}
                </span>
                <span className="text-sm text-gray-600">
                  / {formatHours(metrics.timeSaved.target)} target
                </span>
              </div>
              <Progress value={Math.min(timeSavedPercent, 100)} className="h-2" />
              <p className="text-xs text-gray-600">
                {timeSavedPercent > 100 ? 'Exceeded target' : `${(100 - timeSavedPercent).toFixed(0)}% to target`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-brand-gold/20">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-brand-gold" />
              <h3 className="text-sm font-medium">Monthly Savings</h3>
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-bold text-brand-gold">
                {formatCurrency(metrics.costSavings.monthlySavings)}
              </span>
              <p className="text-xs text-gray-600">
                {metrics.costSavings.roi}% ROI
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-green-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-medium">NPS Score</h3>
              </div>
              {getTrendIcon(metrics.nps.trend)}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-bold ${getNPSColor(metrics.nps.score)}`}>
                  {metrics.nps.score}
                </span>
                <span className="text-sm text-gray-600">
                  ({metrics.nps.responses} responses)
                </span>
              </div>
              <Progress value={npsPercent} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="border-blue-200">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium">Active Users</h3>
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-bold text-blue-600">
                {metrics.engagement.dailyActiveUsers}
              </span>
              <p className="text-xs text-gray-600">
                Daily active users
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Saved Breakdown */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Time Saved Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(metrics.timeSaved.breakdown).map(([category, hours]) => {
              const percentage = (hours / metrics.timeSaved.weekly) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm text-gray-600">{formatHours(hours)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Productivity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Productivity Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-brand-burgundy" />
                  <span className="text-sm">Email Response Time</span>
                </div>
                <span className="text-sm font-medium">{metrics.productivity.emailResponseTime}s</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-brand-burgundy" />
                  <span className="text-sm">Processing Speed</span>
                </div>
                <span className="text-sm font-medium">{metrics.productivity.processingSpeed}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-brand-burgundy" />
                  <span className="text-sm">Tasks Completed</span>
                </div>
                <span className="text-sm font-medium">{metrics.productivity.tasksCompleted}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">NPS Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Promoters</span>
                <Badge className="bg-green-100 text-green-800">{metrics.nps.segments.promoters}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Passives</span>
                <Badge className="bg-yellow-100 text-yellow-800">{metrics.nps.segments.passives}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Detractors</span>
                <Badge className="bg-red-100 text-red-800">{metrics.nps.segments.detractors}%</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Annual Projection */}
      <Card className="border-brand-burgundy/20 bg-gradient-to-r from-brand-burgundy/5 to-brand-gold/5">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Annual Impact Projection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-burgundy mb-2">
                {formatHours(metrics.timeSaved.monthly * 12)}
              </div>
              <div className="text-sm text-gray-600">Time Saved Annually</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-gold mb-2">
                {formatCurrency(metrics.costSavings.annualProjection)}
              </div>
              <div className="text-sm text-gray-600">Annual Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.costSavings.roi}%
              </div>
              <div className="text-sm text-gray-600">Return on Investment</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}