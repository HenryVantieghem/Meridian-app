'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Building2, 
  User, 
  TrendingUp,
  Check,
  Users,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface Persona {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  color: string;
  bgColor: string;
}

const personas: Persona[] = [
  {
    id: 'founder',
    title: 'Founder/CEO',
    description: 'Leading your company with strategic focus',
    icon: Crown,
    features: ['Strategic email prioritization', 'Board communication', 'Investor relations'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'executive',
    title: 'Executive',
    description: 'Managing teams and driving results',
    icon: Building2,
    features: ['Team collaboration', 'Performance tracking', 'Stakeholder management'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'solo',
    title: 'Solo Operator',
    description: 'Maximizing productivity as a one-person show',
    icon: User,
    features: ['Time optimization', 'Client management', 'Personal branding'],
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Managing portfolio and deal flow',
    icon: TrendingUp,
    features: ['Deal flow management', 'Portfolio tracking', 'Network building'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export default function PersonaPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const router = useRouter();

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    // Store in localStorage or state management
    localStorage.setItem('selectedPersona', personaId);
  };

  const handleContinue = () => {
    if (selectedPersona) {
      router.push('/onboarding/preferences');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Choose Your Role
        </Typography>
        <Typography variant="body" className="text-xl text-gray-600 max-w-2xl mx-auto">
          Help us personalize your experience by selecting the role that best describes your work.
        </Typography>
      </motion.div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPersona === persona.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handlePersonaSelect(persona.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${persona.bgColor} rounded-lg flex items-center justify-center`}>
                  <persona.icon className={`w-6 h-6 ${persona.color}`} />
                </div>
                
                <div className="flex-1">
                  <Typography variant="h3" className="text-xl font-semibold text-gray-900 mb-2">
                    {persona.title}
                  </Typography>
                  <Typography variant="body" className="text-gray-600 mb-4">
                    {persona.description}
                  </Typography>
                  
                  <div className="space-y-2">
                    {persona.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <Typography variant="body" className="text-sm text-gray-600">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPersona === persona.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Preview */}
      {selectedPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-2xl p-8 mb-8"
        >
          <Typography variant="h3" className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Personalized Dashboard
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-5 h-5 text-primary-600" />
                <Typography variant="body" className="font-semibold text-gray-900">
                  Priority Focus
                </Typography>
              </div>
              <Typography variant="body" className="text-sm text-gray-600">
                AI will prioritize emails based on your role and communication patterns.
              </Typography>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <Typography variant="body" className="font-semibold text-gray-900">
                  Time Optimization
                </Typography>
              </div>
              <Typography variant="body" className="text-sm text-gray-600">
                Smart scheduling and automation tailored to your workflow.
              </Typography>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-5 h-5 text-primary-600" />
                <Typography variant="body" className="font-semibold text-gray-900">
                  AI Insights
                </Typography>
              </div>
              <Typography variant="body" className="text-sm text-gray-600">
                Personalized analysis and recommendations for your role.
              </Typography>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedPersona}
          className="px-8 py-3"
        >
          Continue to Preferences
        </Button>
      </motion.div>
    </div>
  );
} 