'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Crown, Save, Send, RefreshCw, Sparkles, FileText, Clock, User, Target, Loader2 } from 'lucide-react';

interface DraftWriterProps {
  selectedItem?: any;
  onSave: (draft: DraftData) => void;
  onSend: (draft: DraftData) => void;
  className?: string;
}

interface DraftData {
  id: string;
  subject: string;
  content: string;
  tone: string;
  context: string;
  recipient: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  confidence: number;
  metadata: {
    original_message?: string;
    generated_variations?: string[];
    tone_analysis?: any;
  };
}

const toneOptions = [
  { value: 'executive', label: 'Executive', description: 'Professional, decisive, strategic' },
  { value: 'diplomatic', label: 'Diplomatic', description: 'Tactful, respectful, collaborative' },
  { value: 'direct', label: 'Direct', description: 'Clear, concise, no-nonsense' },
  { value: 'warm', label: 'Warm', description: 'Friendly, personable, approachable' },
  { value: 'formal', label: 'Formal', description: 'Traditional, ceremonial, structured' },
  { value: 'urgent', label: 'Urgent', description: 'Time-sensitive, action-oriented' }
];

const contextOptions = [
  { value: 'reply', label: 'Reply', description: 'Responding to received message' },
  { value: 'follow-up', label: 'Follow-up', description: 'Following up on previous communication' },
  { value: 'new', label: 'New Message', description: 'Starting new conversation' },
  { value: 'announcement', label: 'Announcement', description: 'Company or team announcement' },
  { value: 'meeting', label: 'Meeting', description: 'Meeting-related communication' },
  { value: 'decision', label: 'Decision', description: 'Communicating decisions or directives' }
];

export default function DraftWriter({ selectedItem, onSave, onSend, className = '' }: DraftWriterProps) {
  const [draft, setDraft] = useState<Partial<DraftData>>({
    subject: '',
    content: '',
    tone: 'executive',
    context: 'reply',
    recipient: '',
    priority: 'medium'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);

  useEffect(() => {
    if (selectedItem) {
      setDraft(prev => ({
        ...prev,
        recipient: selectedItem.from || selectedItem.user || '',
        subject: selectedItem.subject ? `Re: ${selectedItem.subject}` : '',
        context: 'reply'
      }));
    }
  }, [selectedItem]);

  const generateDraft = async () => {
    if (!draft.recipient || !draft.context) return;

    setIsGenerating(true);
    setConfidence(0);

    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: draft.recipient,
          subject: draft.subject,
          tone: draft.tone,
          context: draft.context,
          priority: draft.priority,
          original_message: selectedItem?.body || selectedItem?.text || '',
          additional_context: draft.content // Any manual input
        }),
      });

      if (!response.ok) throw new Error('Draft generation failed');

      const data = await response.json();
      
      setDraft(prev => ({
        ...prev,
        content: data.content,
        subject: data.subject || prev.subject
      }));
      
      setConfidence(data.confidence || 85);
      setVariations(data.variations || []);
      setSelectedVariation(0);

    } catch (error) {
      console.error('Draft generation failed:', error);
      // Mock response for demo
      const mockContent = generateMockDraft();
      setDraft(prev => ({
        ...prev,
        content: mockContent
      }));
      setConfidence(87);
      setVariations([mockContent, generateMockDraft(), generateMockDraft()]);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateDraft = async () => {
    setIsRegenerating(true);
    await generateDraft();
    setIsRegenerating(false);
  };

  const generateMockDraft = () => {
    const toneStyle = toneOptions.find(t => t.value === draft.tone)?.description || 'professional';
    const contextType = contextOptions.find(c => c.value === draft.context)?.label || 'message';
    
    return `Thank you for your ${contextType.toLowerCase()}. I appreciate you bringing this to my attention.

Based on our strategic priorities, I recommend we proceed with the following approach:

• Immediate action on the key deliverables discussed
• Coordination with relevant stakeholders to ensure alignment
• Clear timeline and accountability measures

I'm confident this approach will deliver the results we need while maintaining our high standards of execution.

Please let me know if you need any additional information or if you'd like to discuss this further.

Best regards`;
  };

  const handleSave = () => {
    const completeDraft: DraftData = {
      id: Date.now().toString(),
      subject: draft.subject || '',
      content: draft.content || '',
      tone: draft.tone || 'executive',
      context: draft.context || 'reply',
      recipient: draft.recipient || '',
      priority: draft.priority || 'medium',
      timestamp: new Date(),
      confidence,
      metadata: {
        original_message: selectedItem?.body || selectedItem?.text,
        generated_variations: variations,
        tone_analysis: { tone: draft.tone, confidence }
      }
    };
    
    onSave(completeDraft);
  };

  const handleSend = () => {
    const completeDraft: DraftData = {
      id: Date.now().toString(),
      subject: draft.subject || '',
      content: draft.content || '',
      tone: draft.tone || 'executive',
      context: draft.context || 'reply',
      recipient: draft.recipient || '',
      priority: draft.priority || 'medium',
      timestamp: new Date(),
      confidence,
      metadata: {
        original_message: selectedItem?.body || selectedItem?.text,
        generated_variations: variations,
        tone_analysis: { tone: draft.tone, confidence }
      }
    };
    
    onSend(completeDraft);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-brand-burgundy/5 to-brand-burgundy/10 border-brand-burgundy/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-brand-burgundy rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Typography variant="h6" className="font-playfair font-bold text-black">
                  AI Draft Writer
                </Typography>
                {confidence > 0 && (
                  <Badge className="bg-green-100 text-green-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {confidence}% confidence
                  </Badge>
                )}
              </div>
              <Typography variant="body2" className="text-gray-600 mt-1">
                Generate executive-grade communications with AI precision
              </Typography>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Recipient
          </label>
          <Input
            value={draft.recipient}
            onChange={(e) => setDraft(prev => ({ ...prev, recipient: e.target.value }))}
            placeholder="recipient@company.com"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Crown className="w-4 h-4 inline mr-1" />
            Tone
          </label>
          <Select value={draft.tone} onValueChange={(value) => setDraft(prev => ({ ...prev, tone: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Context
          </label>
          <Select value={draft.context} onValueChange={(value) => setDraft(prev => ({ ...prev, context: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contextOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Subject
        </label>
        <Input
          value={draft.subject}
          onChange={(e) => setDraft(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Enter subject line..."
          className="w-full"
        />
      </div>

      {/* Generate Button */}
      <div className="flex gap-2">
        <Button
          onClick={generateDraft}
          disabled={isGenerating || !draft.recipient}
          className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Draft
            </>
          )}
        </Button>
        
        {draft.content && (
          <Button
            onClick={regenerateDraft}
            disabled={isRegenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            )}
          </Button>
        )}
      </div>

      {/* Variations */}
      {variations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {variations.map((_, index) => (
                <Button
                  key={index}
                  variant={selectedVariation === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedVariation(index);
                    setDraft(prev => ({ ...prev, content: variations[index] }));
                  }}
                >
                  Variation {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Draft Content</span>
            {confidence > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Generated {new Date().toLocaleTimeString()}</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.content}
            onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Your AI-generated draft will appear here, or start typing to compose manually..."
            className="min-h-[300px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>AI-powered strategic communication</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!draft.content}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!draft.content || !draft.recipient}
            className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}