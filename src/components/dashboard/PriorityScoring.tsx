'use client';

import { useEffect, useState } from 'react';
import { Email, SlackMessage } from '@/types';

interface PriorityScore {
  score: number;
  confidence: number;
  factors: {
    sender: number;
    keywords: number;
    urgency: number;
    vip: number;
    engagement: number;
  };
  explanation: string;
}

interface VIPContact {
  email: string;
  name: string;
  importance: number;
  relationship: 'direct_report' | 'manager' | 'peer' | 'external' | 'board' | 'investor';
}

export class PriorityScoring {
  private vipContacts: VIPContact[] = [];
  private userPreferences: any = {};
  private behaviorData: any = {};

  constructor() {
    this.loadVIPContacts();
    this.loadUserPreferences();
    this.loadBehaviorData();
  }

  private loadVIPContacts() {
    // In real app, this would load from database
    const storedVIPs = localStorage.getItem('vipContacts');
    if (storedVIPs) {
      this.vipContacts = JSON.parse(storedVIPs);
    } else {
      // Default VIP patterns
      this.vipContacts = [
        { email: 'ceo@', name: 'CEO', importance: 100, relationship: 'manager' },
        { email: 'founder@', name: 'Founder', importance: 95, relationship: 'manager' },
        { email: 'president@', name: 'President', importance: 90, relationship: 'manager' },
        { email: 'board@', name: 'Board Member', importance: 85, relationship: 'board' },
        { email: 'investor@', name: 'Investor', importance: 80, relationship: 'investor' },
      ];
    }
  }

  private loadUserPreferences() {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      this.userPreferences = JSON.parse(stored);
    }
  }

  private loadBehaviorData() {
    const stored = localStorage.getItem('behaviorData');
    if (stored) {
      this.behaviorData = JSON.parse(stored);
    }
  }

  public scoreEmail(email: Email): PriorityScore {
    const factors = {
      sender: this.scoreSender(email.from || ''),
      keywords: this.scoreKeywords(email.subject || '', email.body || ''),
      urgency: this.scoreUrgency(email.subject || '', email.body || ''),
      vip: this.scoreVIP(email.from || ''),
      engagement: this.scoreEngagement(email.from || '')
    };

    const weightedScore = (
      factors.sender * 0.25 +
      factors.keywords * 0.20 +
      factors.urgency * 0.30 +
      factors.vip * 0.20 +
      factors.engagement * 0.05
    );

    const confidence = this.calculateConfidence(factors);
    const explanation = this.generateExplanation(factors);

    return {
      score: Math.round(weightedScore),
      confidence,
      factors,
      explanation
    };
  }

  public scoreSlackMessage(message: SlackMessage): PriorityScore {
    const factors = {
      sender: this.scoreSender(message.user || ''),
      keywords: this.scoreKeywords(message.text, ''),
      urgency: this.scoreUrgency(message.text, ''),
      vip: this.scoreVIP(message.user || ''),
      engagement: this.scoreEngagement(message.user || '')
    };

    const weightedScore = (
      factors.sender * 0.20 +
      factors.keywords * 0.25 +
      factors.urgency * 0.35 +
      factors.vip * 0.15 +
      factors.engagement * 0.05
    );

    const confidence = this.calculateConfidence(factors);
    const explanation = this.generateExplanation(factors);

    return {
      score: Math.round(weightedScore),
      confidence,
      factors,
      explanation
    };
  }

  private scoreSender(sender: string): number {
    // Score based on sender domain and known patterns
    const domain = sender.split('@')[1]?.toLowerCase() || '';
    
    // Internal company emails get higher priority
    if (domain === 'company.com' || domain === 'internal.com') return 70;
    
    // Known important domains
    const importantDomains = ['board.com', 'investors.com', 'partners.com'];
    if (importantDomains.includes(domain)) return 80;
    
    // C-suite patterns
    if (sender.toLowerCase().includes('ceo') || 
        sender.toLowerCase().includes('founder') || 
        sender.toLowerCase().includes('president')) return 90;
    
    return 50; // Default score
  }

  private scoreKeywords(subject: string, body: string): number {
    const content = (subject + ' ' + body).toLowerCase();
    
    const criticalKeywords = ['urgent', 'asap', 'emergency', 'critical', 'deadline', 'breaking'];
    const highKeywords = ['important', 'meeting', 'decision', 'approve', 'review', 'action required'];
    const mediumKeywords = ['update', 'fyi', 'information', 'notice', 'reminder'];
    
    let score = 40; // Base score
    
    // Critical keywords
    criticalKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 15;
    });
    
    // High priority keywords
    highKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 10;
    });
    
    // Medium priority keywords
    mediumKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 5;
    });
    
    return Math.min(score, 100);
  }

  private scoreUrgency(subject: string, body: string): number {
    const content = (subject + ' ' + body).toLowerCase();
    
    // Time-sensitive indicators
    const urgentPatterns = [
      /urgent/g,
      /asap/g,
      /emergency/g,
      /deadline/g,
      /today/g,
      /now/g,
      /immediately/g,
      /time.sensitive/g
    ];
    
    let urgencyScore = 30;
    
    urgentPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        urgencyScore += matches.length * 20;
      }
    });
    
    // Check for time references
    if (content.includes('today') || content.includes('this morning')) urgencyScore += 25;
    if (content.includes('tomorrow') || content.includes('next week')) urgencyScore += 10;
    
    return Math.min(urgencyScore, 100);
  }

  private scoreVIP(contact: string): number {
    // Check against VIP contact list
    const vipMatch = this.vipContacts.find(vip => 
      contact.toLowerCase().includes(vip.email.toLowerCase()) ||
      contact.toLowerCase().includes(vip.name.toLowerCase())
    );
    
    if (vipMatch) {
      return vipMatch.importance;
    }
    
    // Pattern-based VIP detection
    const vipPatterns = [
      'ceo@', 'founder@', 'president@', 'chairman@',
      'board@', 'investor@', 'partner@', 'director@'
    ];
    
    for (const pattern of vipPatterns) {
      if (contact.toLowerCase().includes(pattern)) {
        return 85;
      }
    }
    
    return 40;
  }

  private scoreEngagement(contact: string): number {
    // Score based on historical engagement patterns
    const engagementHistory = this.behaviorData[contact] || { replies: 0, opens: 0, time: 0 };
    
    let score = 40;
    
    // High reply rate indicates important contact
    if (engagementHistory.replies > 10) score += 20;
    else if (engagementHistory.replies > 5) score += 10;
    
    // Quick response time indicates importance
    if (engagementHistory.time < 3600) score += 15; // Less than 1 hour
    else if (engagementHistory.time < 86400) score += 10; // Less than 1 day
    
    return Math.min(score, 100);
  }

  private calculateConfidence(factors: any): number {
    // Calculate confidence based on factor consistency
    const values = Object.values(factors) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    
    // Lower variance = higher confidence
    const confidence = Math.max(50, 100 - (variance * 0.5));
    
    return Math.round(confidence);
  }

  private generateExplanation(factors: any): string {
    const explanations = [];
    
    if (factors.vip > 70) explanations.push('VIP contact detected');
    if (factors.urgency > 70) explanations.push('High urgency indicators');
    if (factors.keywords > 70) explanations.push('Important keywords found');
    if (factors.sender > 70) explanations.push('Trusted sender');
    if (factors.engagement > 70) explanations.push('High engagement history');
    
    if (explanations.length === 0) explanations.push('Standard priority assessment');
    
    return explanations.join(', ');
  }

  public updateVIPContacts(contacts: VIPContact[]) {
    this.vipContacts = contacts;
    localStorage.setItem('vipContacts', JSON.stringify(contacts));
  }

  public updateBehaviorData(contact: string, data: any) {
    this.behaviorData[contact] = { ...this.behaviorData[contact], ...data };
    localStorage.setItem('behaviorData', JSON.stringify(this.behaviorData));
  }

  public getPriorityLabel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 65) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}

// Hook for using priority scoring
export function usePriorityScoring() {
  const [priorityEngine] = useState(() => new PriorityScoring());
  
  const scoreItem = (item: Email | SlackMessage) => {
    if ('subject' in item) {
      return priorityEngine.scoreEmail(item as Email);
    } else {
      return priorityEngine.scoreSlackMessage(item as SlackMessage);
    }
  };
  
  return {
    scoreItem,
    updateVIPContacts: (contacts: VIPContact[]) => priorityEngine.updateVIPContacts(contacts),
    updateBehaviorData: (contact: string, data: any) => priorityEngine.updateBehaviorData(contact, data),
    getPriorityLabel: (score: number) => priorityEngine.getPriorityLabel(score)
  };
}