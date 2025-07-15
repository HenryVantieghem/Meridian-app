"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
} from "lucide-react";

interface VIPInsight {
  id: string;
  vipName: string;
  vipEmail: string;
  vipTitle: string;
  company: string;
  category: "board" | "investor" | "client" | "partner";
  networkHealth: number;
  engagementTrend: "up" | "down" | "stable";
  lastInteraction: Date;
  responseTime: number; // in hours
  communicationFrequency: number; // messages per week
  sentimentScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  insights: string[];
  recommendations: string[];
}

interface VIPInsightsDashboardProps {
  className?: string;
}

export default function VIPInsightsDashboard({
  className = "",
}: VIPInsightsDashboardProps) {
  const [vipInsights, setVipInsights] = useState<VIPInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "quarter"
  >("month");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "board" | "investor" | "client" | "partner"
  >("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateVIPInsights();
  }, [selectedTimeframe, selectedCategory]);

  const generateVIPInsights = async () => {
    setIsLoading(true);

    // Mock data generation - in real app, this would fetch from API
    const mockInsights: VIPInsight[] = [
      {
        id: "1",
        vipName: "John Smith",
        vipEmail: "john.smith@boardmember.com",
        vipTitle: "Board Member",
        company: "Your Company",
        category: "board",
        networkHealth: 85,
        engagementTrend: "up",
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        responseTime: 2.5,
        communicationFrequency: 4,
        sentimentScore: 78,
        riskLevel: "low",
        insights: [
          "Increased engagement in last 2 weeks",
          "Positive sentiment in recent exchanges",
          "Consistent response pattern",
        ],
        recommendations: [
          "Schedule quarterly strategic update",
          "Share latest milestone achievements",
        ],
      },
      {
        id: "2",
        vipName: "Sarah Chen",
        vipEmail: "sarah.investor@vc.com",
        vipTitle: "Partner",
        company: "Venture Capital LLC",
        category: "investor",
        networkHealth: 92,
        engagementTrend: "up",
        lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        responseTime: 1.2,
        communicationFrequency: 6,
        sentimentScore: 85,
        riskLevel: "low",
        insights: [
          "Very responsive to strategic updates",
          "High engagement with financial reports",
          "Strong advocate for your initiatives",
        ],
        recommendations: [
          "Invite to upcoming board presentation",
          "Share competitive analysis insights",
        ],
      },
      {
        id: "3",
        vipName: "Michael Rodriguez",
        vipEmail: "ceo@majorclient.com",
        vipTitle: "CEO",
        company: "Major Client Corp",
        category: "client",
        networkHealth: 65,
        engagementTrend: "down",
        lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        responseTime: 8.5,
        communicationFrequency: 1,
        sentimentScore: 62,
        riskLevel: "medium",
        insights: [
          "Decreased communication frequency",
          "Longer response times than usual",
          "Neutral sentiment in recent messages",
        ],
        recommendations: [
          "Schedule check-in call immediately",
          "Address potential concerns proactively",
          "Prepare relationship recovery plan",
        ],
      },
      {
        id: "4",
        vipName: "Emily Johnson",
        vipEmail: "founder@strategic.com",
        vipTitle: "Founder",
        company: "Strategic Partner Inc",
        category: "partner",
        networkHealth: 78,
        engagementTrend: "stable",
        lastInteraction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        responseTime: 4.2,
        communicationFrequency: 3,
        sentimentScore: 74,
        riskLevel: "low",
        insights: [
          "Stable relationship with consistent engagement",
          "Good collaboration on joint initiatives",
          "Positive sentiment maintained",
        ],
        recommendations: [
          "Explore new partnership opportunities",
          "Share mutual success stories",
        ],
      },
    ];

    // Filter by category
    const filteredInsights =
      selectedCategory === "all"
        ? mockInsights
        : mockInsights.filter(
            (insight) => insight.category === selectedCategory,
          );

    setVipInsights(filteredInsights);
    setIsLoading(false);
  };

  const getNetworkHealthColor = (health: number): string => {
    if (health >= 80) return "text-green-600";
    if (health >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getNetworkHealthBg = (health: number): string => {
    if (health >= 80) return "bg-green-100";
    if (health >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRiskLevelColor = (risk: string): string => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "stable":
        return <Activity className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "board":
        return <Crown className="w-4 h-4" />;
      case "investor":
        return <TrendingUp className="w-4 h-4" />;
      case "client":
        return <Star className="w-4 h-4" />;
      case "partner":
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "board":
        return "bg-purple-100 text-purple-800";
      case "investor":
        return "bg-green-100 text-green-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      case "partner":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const averageNetworkHealth =
    vipInsights.reduce((sum, insight) => sum + insight.networkHealth, 0) /
      vipInsights.length || 0;
  const atRiskCount = vipInsights.filter(
    (insight) => insight.riskLevel === "high" || insight.riskLevel === "medium",
  ).length;
  const positiveEngagement = vipInsights.filter(
    (insight) => insight.engagementTrend === "up",
  ).length;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-brand-burgundy/5 to-brand-burgundy/10 border-brand-burgundy/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-brand-burgundy" />
            VIP Relationship Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Timeframe:
              </Typography>
              <select
                value={selectedTimeframe}
                onChange={(e) =>
                  setSelectedTimeframe(
                    e.target.value as "week" | "month" | "quarter",
                  )
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Category:
              </Typography>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="board">Board Members</option>
                <option value="investor">Investors</option>
                <option value="client">Clients</option>
                <option value="partner">Partners</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 mb-1">
                  Network Health
                </Typography>
                <Typography
                  variant="h4"
                  className={`font-bold ${getNetworkHealthColor(averageNetworkHealth)}`}
                >
                  {Math.round(averageNetworkHealth)}%
                </Typography>
              </div>
              <div
                className={`p-3 rounded-lg ${getNetworkHealthBg(averageNetworkHealth)}`}
              >
                <BarChart3
                  className={`w-6 h-6 ${getNetworkHealthColor(averageNetworkHealth)}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 mb-1">
                  At Risk Relationships
                </Typography>
                <Typography
                  variant="h4"
                  className={`font-bold ${atRiskCount > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {atRiskCount}
                </Typography>
              </div>
              <div
                className={`p-3 rounded-lg ${atRiskCount > 0 ? "bg-red-100" : "bg-green-100"}`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${atRiskCount > 0 ? "text-red-600" : "text-green-600"}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 mb-1">
                  Positive Engagement
                </Typography>
                <Typography variant="h4" className="font-bold text-green-600">
                  {positiveEngagement}
                </Typography>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Insights */}
      <div className="space-y-4">
        {vipInsights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold">
                    {insight.vipName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Typography variant="h6" className="font-bold text-black">
                        {insight.vipName}
                      </Typography>
                      <Badge
                        className={`${getCategoryColor(insight.category)} flex items-center gap-1`}
                      >
                        {getCategoryIcon(insight.category)}
                        {insight.category}
                      </Badge>
                    </div>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      {insight.vipTitle} at {insight.company}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      {insight.vipEmail}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getRiskLevelColor(insight.riskLevel)}>
                    {insight.riskLevel} risk
                  </Badge>
                  {getTrendIcon(insight.engagementTrend)}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getNetworkHealthColor(insight.networkHealth)}`}
                  >
                    {insight.networkHealth}%
                  </div>
                  <div className="text-sm text-gray-600">Network Health</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {insight.responseTime}h
                  </div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {insight.communicationFrequency}
                  </div>
                  <div className="text-sm text-gray-600">Msgs/Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {insight.sentimentScore}%
                  </div>
                  <div className="text-sm text-gray-600">Sentiment</div>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="h6"
                    className="font-semibold text-black mb-2 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Key Insights
                  </Typography>
                  <ul className="space-y-1">
                    {insight.insights.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <div className="w-1 h-1 bg-brand-burgundy rounded-full mt-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Typography
                    variant="h6"
                    className="font-semibold text-black mb-2 flex items-center gap-1"
                  >
                    <Star className="w-4 h-4 text-yellow-600" />
                    Recommendations
                  </Typography>
                  <ul className="space-y-1">
                    {insight.recommendations.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <div className="w-1 h-1 bg-brand-burgundy rounded-full mt-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Last Interaction */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last interaction:{" "}
                    {insight.lastInteraction.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View History
                  </Button>
                  <Button
                    size="sm"
                    className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90"
                  >
                    Schedule Follow-up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vipInsights.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No VIP insights available
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Configure your VIP contacts to see relationship intelligence
            </Typography>
            <Button className="mt-4 bg-brand-burgundy text-white hover:bg-brand-burgundy/90">
              Manage VIP Contacts
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
