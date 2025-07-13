'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Building2, 
  User, 
  TrendingUp,
  Check,
  Mail, 
  Clock, 
  Star,
  Zap,
  Calendar,
  ArrowRight,
  ArrowLeft
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
    id: 'executive',
    title: 'C-Level Executive',
    description: 'CEO, CFO, CTO, or other C-suite leader',
    icon: Crown,
    features: ['Strategic decision making', 'Board communications', 'Stakeholder management'],
    color: 'text-brand-burgundy',
    bgColor: 'bg-brand-burgundy/10'
  },
  {
    id: 'director',
    title: 'Senior Director',
    description: 'VP, Director, or senior management',
    icon: Building2,
    features: ['Team leadership', 'Cross-functional coordination', 'Strategic planning'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'manager',
    title: 'Middle Manager',
    description: 'Manager, Team Lead, or department head',
    icon: User,
    features: ['Team management', 'Process optimization', 'Resource allocation'],
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Founder, startup leader, or business owner',
    icon: TrendingUp,
    features: ['Business development', 'Investor relations', 'Growth strategy'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

const painPoints = [
  { id: 'overwhelm', label: 'Email overwhelm', icon: Mail },
  { id: 'prioritization', label: 'Difficulty prioritizing', icon: Star },
  { id: 'meetings', label: 'Too many meetings', icon: Calendar },
  { id: 'responsiveness', label: 'Pressure to respond quickly', icon: Clock },
  { id: 'clarity', label: 'Lack of strategic clarity', icon: Zap },
  { id: 'delegation', label: 'Difficulty delegating', icon: User }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [vipContacts, setVipContacts] = useState([
    { name: '', email: '', role: '' },
    { name: '', email: '', role: '' },
    { name: '', email: '', role: '' }
  ]);
  const [isConnecting, setIsConnecting] = useState(false);

  const handlePainPointToggle = (painPointId: string) => {
    setSelectedPainPoints(prev => 
      prev.includes(painPointId) 
        ? prev.filter(id => id !== painPointId)
        : [...prev, painPointId]
    );
  };

  const handleVipContactChange = (index: number, field: string, value: string) => {
    setVipContacts(prev => 
      prev.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  const handleConnectAccounts = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnecting(false);
    setStep(3);
  };

  const handleComplete = () => {
    // Save onboarding data
    router.push('/dashboard');
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-brand-burgundy mr-3" />
            <h1 className="text-3xl font-serif text-black">Welcome to Napoleon</h1>
          </div>
          <p className="text-gray-600 mb-6">Let&apos;s personalize your AI strategic commander</p>
          
          {/* Progress Bar */}
          <div className="w-full mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Profile</span>
              <span>Connect</span>
              <span>VIP Setup</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                {/* Role Selection */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">What&apos;s your role?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personas.map((persona) => (
                      <div
                        key={persona.id}
                        onClick={() => setSelectedPersona(persona.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedPersona(persona.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPersona === persona.id
                            ? 'border-brand-burgundy bg-brand-burgundy/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <persona.icon className={`w-6 h-6 mr-3 ${persona.color}`} />
                          <h3 className="font-semibold">{persona.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {persona.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="w-3 h-3 mr-2 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pain Points */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">What challenges do you face?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {painPoints.map((painPoint) => (
                      <div
                        key={painPoint.id}
                        onClick={() => handlePainPointToggle(painPoint.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handlePainPointToggle(painPoint.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPainPoints.includes(painPoint.id)
                            ? 'border-brand-burgundy bg-brand-burgundy/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <painPoint.icon className="w-4 h-4 mr-2 text-brand-burgundy" />
                          <span className="text-sm">{painPoint.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedPersona}
                    className="bg-black text-white hover:bg-[#801B2B]"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Connect your accounts</h2>
                  <p className="text-gray-600 mb-6">
                    Napoleon will analyze your communications to provide strategic insights
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-6 h-6 mr-3 text-red-500" />
                          <div>
                            <h3 className="font-semibold">Gmail</h3>
                            <p className="text-sm text-gray-600">Connect your email account</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Zap className="w-6 h-6 mr-3 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">Slack</h3>
                            <p className="text-sm text-gray-600">Connect your workspace</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-6 h-6 mr-3 text-purple-500" />
                          <div>
                            <h3 className="font-semibold">Outlook</h3>
                            <p className="text-sm text-gray-600">Connect your calendar</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleConnectAccounts}
                    disabled={isConnecting}
                    className="bg-black text-white hover:bg-[#801B2B]"
                  >
                    {isConnecting ? 'Connecting...' : 'Continue'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Set up your VIP contacts</h2>
                  <p className="text-gray-600 mb-6">
                    These are the people whose messages Napoleon will prioritize and analyze most carefully
                  </p>
                  
                  <div className="space-y-4">
                    {vipContacts.map((contact, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                        <Input
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => handleVipContactChange(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleVipContactChange(index, 'email', e.target.value)}
                        />
                        <Input
                          placeholder="Role/Relationship"
                          value={contact.role}
                          onChange={(e) => handleVipContactChange(index, 'role', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-black text-white hover:bg-[#801B2B]"
                  >
                    Complete Setup
                    <Check className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
} 