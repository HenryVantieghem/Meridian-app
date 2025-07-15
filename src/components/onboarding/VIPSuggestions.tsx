'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Crown, Plus, Check, Star, Users, TrendingUp } from 'lucide-react';

interface VIPSuggestion {
  id: string;
  email: string;
  name: string;
  title: string;
  company: string;
  reason: string;
  importance: number;
  category: 'board' | 'investor' | 'client' | 'partner' | 'leadership';
  avatar?: string;
}

interface VIPSuggestionsProps {
  onComplete: (selectedVIPs: VIPSuggestion[]) => void;
  onBack: () => void;
}

export default function VIPSuggestions({ onComplete, onBack }: VIPSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<VIPSuggestion[]>([]);
  const [selectedVIPs, setSelectedVIPs] = useState<VIPSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis of email patterns
    const simulateAnalysis = async () => {
      setIsAnalyzing(true);
      
      // Mock delay for analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock VIP suggestions based on common patterns
      const mockSuggestions: VIPSuggestion[] = [
        {
          id: '1',
          email: 'john.smith@boardmember.com',
          name: 'John Smith',
          title: 'Board Member',
          company: 'Your Company',
          reason: 'Frequent high-priority communications',
          importance: 95,
          category: 'board'
        },
        {
          id: '2',
          email: 'sarah.investor@vc.com',
          name: 'Sarah Chen',
          title: 'Partner',
          company: 'Venture Capital LLC',
          reason: 'Investment-related communications',
          importance: 90,
          category: 'investor'
        },
        {
          id: '3',
          email: 'ceo@majoriclient.com',
          name: 'Michael Rodriguez',
          title: 'CEO',
          company: 'Major Client Corp',
          reason: 'Key client relationship',
          importance: 85,
          category: 'client'
        },
        {
          id: '4',
          email: 'founder@startup.com',
          name: 'Emily Johnson',
          title: 'Founder',
          company: 'Strategic Partner',
          reason: 'Partnership discussions',
          importance: 80,
          category: 'partner'
        },
        {
          id: '5',
          email: 'director@internal.com',
          name: 'David Wilson',
          title: 'Director',
          company: 'Internal Team',
          reason: 'Internal leadership communication',
          importance: 75,
          category: 'leadership'
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    };

    simulateAnalysis();
  }, []);

  const toggleVIP = (vip: VIPSuggestion) => {
    setSelectedVIPs(prev => {
      const isSelected = prev.some(v => v.id === vip.id);
      if (isSelected) {
        return prev.filter(v => v.id !== vip.id);
      } else {
        return [...prev, vip];
      }
    });
  };

  const handleComplete = () => {
    // Save selected VIPs to localStorage
    localStorage.setItem('selectedVIPs', JSON.stringify(selectedVIPs));
    onComplete(selectedVIPs);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'board': return <Crown className="w-4 h-4" />;
      case 'investor': return <TrendingUp className="w-4 h-4" />;
      case 'client': return <Star className="w-4 h-4" />;
      case 'partner': return <Users className="w-4 h-4" />;
      case 'leadership': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'board': return 'bg-red-100 text-red-800';
      case 'investor': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      case 'leadership': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 90) return 'text-red-600';
    if (importance >= 80) return 'text-orange-600';
    if (importance >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-burgundy rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <Typography variant="h4" className="font-playfair font-bold text-black mb-2">
            Analyzing Your Communications
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Our AI is identifying potential VIP contacts from your email patterns...
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h4" className="font-playfair font-bold text-black mb-2">
          Suggested VIP Contacts
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          We've identified potential VIP contacts based on your communication patterns. Select the ones you'd like to prioritize.
        </Typography>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-brand-burgundy rounded-full"></div>
            <span>AI-detected VIPs</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-600" />
            <span>{selectedVIPs.length} selected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((vip) => {
          const isSelected = selectedVIPs.some(v => v.id === vip.id);
          
          return (
            <Card 
              key={vip.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-brand-burgundy bg-brand-burgundy/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleVIP(vip)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold">
                      {vip.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography variant="h6" className="font-semibold text-black">
                          {vip.name}
                        </Typography>
                        <Badge className={`${getCategoryColor(vip.category)} flex items-center gap-1`}>
                          {getCategoryIcon(vip.category)}
                          {vip.category}
                        </Badge>
                      </div>
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        {vip.title} at {vip.company}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 mb-2">
                        {vip.email}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Typography variant="body2" className="text-gray-600">
                          {vip.reason}
                        </Typography>
                        <div className={`text-sm font-medium ${getImportanceColor(vip.importance)}`}>
                          {vip.importance}% importance
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isSelected ? (
                      <div className="w-6 h-6 bg-brand-burgundy rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-brand-burgundy/5 to-brand-burgundy/10 border-brand-burgundy/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-brand-burgundy" />
            VIP Selection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-burgundy">{selectedVIPs.length}</div>
              <div className="text-sm text-gray-600">Selected VIPs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {selectedVIPs.filter(v => v.category === 'board').length}
              </div>
              <div className="text-sm text-gray-600">Board Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {selectedVIPs.filter(v => v.category === 'investor').length}
              </div>
              <div className="text-sm text-gray-600">Investors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedVIPs.filter(v => v.category === 'client').length}
              </div>
              <div className="text-sm text-gray-600">Key Clients</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-full px-6"
        >
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 rounded-full px-6"
        >
          Complete Setup ({selectedVIPs.length} VIPs)
        </Button>
      </div>
    </div>
  );
}