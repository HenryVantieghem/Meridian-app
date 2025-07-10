'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export function PerformanceMonitor({ showDetails = false, className }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      setIsMonitoring(true);

      // Measure Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const ttfb = navigationEntry?.responseStart - navigationEntry?.requestStart || 0;

      // Measure Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
          }
          if (entry.entryType === 'first-input') {
            const event = entry as PerformanceEventTiming;
            setMetrics(prev => ({ ...prev, fid: event.processingStart - event.startTime }));
          }
          if (entry.entryType === 'layout-shift') {
            const cls = (entry as any).value;
            setMetrics(prev => ({ ...prev, cls }));
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Measure First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime, ttfb }));
      }

      // Cleanup observer after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        setIsMonitoring(false);
      }, 10000);
    };

    // Start monitoring after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const getScore = (metric: keyof PerformanceMetrics, value: number | undefined): { score: number; color: string; label: string } => {
    if (value === undefined) {
      return { score: 0, color: 'bg-gray-100 text-gray-800', label: 'Not Available' };
    }
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    let score: number;
    let color: string;
    let label: string;

    if (value <= threshold.good) {
      score = 100;
      color = 'bg-green-100 text-green-800';
      label = 'Good';
    } else if (value <= threshold.poor) {
      score = 50;
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Needs Improvement';
    } else {
      score = 0;
      color = 'bg-red-100 text-red-800';
      label = 'Poor';
    }

    return { score, color, label };
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms'): string => {
    if (value === undefined) {
      return 'N/A';
    }
    if (value < 1000) {
      return `${Math.round(value)}${unit}`;
    }
    return `${(value / 1000).toFixed(1)}s`;
  };

  if (!metrics && !isMonitoring) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <Typography variant="h3" className="text-lg font-semibold">
            Performance
          </Typography>
        </div>
        {isMonitoring && (
          <Badge className="animate-pulse bg-gray-200 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Measuring...
          </Badge>
        )}
      </div>

      {metrics && (
        <div className="space-y-3">
          {/* Core Web Vitals */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="LCP"
              value={formatMetric(metrics.lcp)}
              description="Largest Contentful Paint"
              score={getScore('lcp', metrics.lcp)}
            />
            <MetricCard
              title="FID"
              value={formatMetric(metrics.fid)}
              description="First Input Delay"
              score={getScore('fid', metrics.fid)}
            />
            <MetricCard
              title="CLS"
              value={metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
              description="Cumulative Layout Shift"
              score={getScore('cls', metrics.cls)}
            />
            <MetricCard
              title="FCP"
              value={formatMetric(metrics.fcp)}
              description="First Contentful Paint"
              score={getScore('fcp', metrics.fcp)}
            />
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Typography variant="h4" className="text-sm font-medium mb-2">
                Additional Metrics
              </Typography>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time to First Byte</span>
                  <span className="text-sm font-medium">{formatMetric(metrics.ttfb)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  score: { score: number; color: string; label: string };
}

function MetricCard({ title, value, description, score }: MetricCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <Typography variant="h4" className="text-sm font-semibold">
          {title}
        </Typography>
        <Badge className={score.color}>
          {score.label}
        </Badge>
      </div>
      <Typography variant="h3" className="text-lg font-bold text-gray-900">
        {value}
      </Typography>
      <Typography variant="body" className="text-xs text-gray-600">
        {description}
      </Typography>
    </div>
  );
}

// Performance warning component
interface PerformanceWarningProps {
  threshold?: number;
  className?: string;
}

export function PerformanceWarning({ threshold = 3000, className }: PerformanceWarningProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPerformance = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigationEntry?.loadEventEnd - navigationEntry?.loadEventStart || 0;

      if (loadTime > threshold) {
        setIsSlow(true);
      }
    };

    if (document.readyState === 'complete') {
      checkPerformance();
    } else {
      window.addEventListener('load', checkPerformance);
      return () => window.removeEventListener('load', checkPerformance);
    }
  }, [threshold]);

  if (!isSlow) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <Typography variant="body" className="text-sm text-yellow-800">
          This page is loading slower than expected. Consider optimizing images or reducing bundle size.
        </Typography>
      </div>
    </div>
  );
}

// Performance optimization suggestions
export function PerformanceSuggestions() {
  const suggestions = [
    {
      title: 'Optimize Images',
      description: 'Use WebP format and implement lazy loading',
      impact: 'High',
      effort: 'Medium',
    },
    {
      title: 'Code Splitting',
      description: 'Split your bundle into smaller chunks',
      impact: 'High',
      effort: 'Low',
    },
    {
      title: 'Caching',
      description: 'Implement proper caching strategies',
      impact: 'Medium',
      effort: 'Medium',
    },
    {
      title: 'CDN',
      description: 'Use a CDN for static assets',
      impact: 'Medium',
      effort: 'Low',
    },
  ];

  return (
    <Card className="p-4">
      <Typography variant="h3" className="text-lg font-semibold mb-4">
        Performance Suggestions
      </Typography>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Typography variant="h4" className="text-sm font-medium">
                {suggestion.title}
              </Typography>
              <Typography variant="body" className="text-xs text-gray-600">
                {suggestion.description}
              </Typography>
            </div>
            <div className="flex space-x-2">
              <Badge className="text-xs border border-gray-300 bg-white">
                Impact: {suggestion.impact}
              </Badge>
              <Badge className="text-xs border border-gray-300 bg-white">
                Effort: {suggestion.effort}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 