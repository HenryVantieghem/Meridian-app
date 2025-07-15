'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Zap, Crown, Search, Send, Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface CommandBarWiringProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

interface QueryResult {
  id: string;
  type: 'summary' | 'action' | 'insight' | 'draft';
  title: string;
  content: string;
  confidence: number;
  timestamp: Date;
  metadata?: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  command: string;
  category: 'briefing' | 'drafting' | 'analysis' | 'scheduling';
}

const quickActions: QuickAction[] = [
  {
    id: 'daily-brief',
    label: 'Daily Strategic Brief',
    icon: <Crown className="w-4 h-4" />,
    description: 'Get your executive summary for today',
    command: 'generate daily brief',
    category: 'briefing'
  },
  {
    id: 'vip-status',
    label: 'VIP Status Update',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Check on critical relationships',
    command: 'show vip status',
    category: 'analysis'
  },
  {
    id: 'draft-reply',
    label: 'Draft Strategic Reply',
    icon: <Zap className="w-4 h-4" />,
    description: 'AI-powered response generation',
    command: 'draft reply to latest email',
    category: 'drafting'
  },
  {
    id: 'schedule-optimize',
    label: 'Optimize Schedule',
    icon: <Clock className="w-4 h-4" />,
    description: 'Intelligent calendar management',
    command: 'optimize my schedule',
    category: 'scheduling'
  }
];

export default function CommandBarWiring({ isOpen, onClose, onCommand }: CommandBarWiringProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error('Query failed');

      const data = await response.json();
      setResults(data.results || []);
      onCommand(query);
    } catch (error) {
      console.error('Command execution failed:', error);
      // Mock response for demo
      setResults([
        {
          id: '1',
          type: 'summary',
          title: 'Strategic Analysis',
          content: `Based on your query "${query}", here's what I found: You have 3 critical emails requiring immediate attention, 2 VIP communications pending response, and 1 strategic opportunity identified.`,
          confidence: 85,
          timestamp: new Date(),
          metadata: { priority: 'high' }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    setSelectedAction(action.id);
    setQuery(action.command);
    
    // Auto-execute the command
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      setSelectedAction(null);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-brand-burgundy/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-brand-burgundy/5 to-brand-burgundy/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-burgundy rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <Typography variant="h6" className="font-playfair font-bold text-black">
                  Napoleon Command Center
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Your AI Strategic Assistant
                </Typography>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Napoleon anything... (e.g., 'Show me today's priorities' or 'Draft a response to the board')"
                className="w-full pl-12 pr-12 py-4 text-lg border-gray-300 focus:border-brand-burgundy focus:ring-brand-burgundy"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-burgundy hover:bg-brand-burgundy/90"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>

          {/* Quick Actions */}
          {!query && !results.length && (
            <div className="p-6">
              <Typography variant="h6" className="font-semibold text-black mb-4">
                Quick Actions
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={`p-4 h-auto text-left justify-start hover:bg-brand-burgundy/5 hover:border-brand-burgundy/30 transition-all ${
                      selectedAction === action.id ? 'bg-brand-burgundy/5 border-brand-burgundy/30' : ''
                    }`}
                    onClick={() => handleQuickAction(action)}
                    disabled={selectedAction === action.id}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-burgundy/10 rounded-lg">
                        {selectedAction === action.id ? (
                          <Loader2 className="w-4 h-4 text-brand-burgundy animate-spin" />
                        ) : (
                          action.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{action.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="p-6 max-h-96 overflow-y-auto">
              <Typography variant="h6" className="font-semibold text-black mb-4">
                Results
              </Typography>
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="border-gray-200 hover:border-brand-burgundy/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-brand-burgundy/10 text-brand-burgundy border-brand-burgundy/20">
                            {result.type}
                          </Badge>
                          <Typography variant="h6" className="font-semibold text-black">
                            {result.title}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {result.confidence}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      <Typography variant="body1" className="text-gray-700 leading-relaxed">
                        {result.content}
                      </Typography>
                      {result.metadata?.priority && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Badge className={`${
                            result.metadata.priority === 'high' ? 'bg-red-100 text-red-800' :
                            result.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {result.metadata.priority} priority
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span>Powered by Napoleon AI</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}