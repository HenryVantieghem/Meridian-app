'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Clock, 
  Star,
  Zap,
  Calendar
} from 'lucide-react';

interface Preferences {
  emailVolume: number;
  vipContacts: string[];
  responseUrgency: 'instant' | 'same-day' | '48h';
  workHours: {
    start: string;
    end: string;
  };
  timezone: string;
}

const urgencyOptions = [
  { id: 'instant', label: 'Instant', description: 'Respond immediately to urgent emails', icon: Zap },
  { id: 'same-day', label: 'Same Day', description: 'Respond within 24 hours', icon: Clock },
  { id: '48h', label: '48 Hours', description: 'Respond within 48 hours', icon: Calendar }
];

const timezones = [
  'UTC-8 (PST)',
  'UTC-7 (MST)',
  'UTC-6 (CST)',
  'UTC-5 (EST)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+2 (EET)',
  'UTC+5:30 (IST)',
  'UTC+8 (CST)',
  'UTC+9 (JST)'
];

export default function PreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>({
    emailVolume: 100,
    vipContacts: [],
    responseUrgency: 'same-day',
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    timezone: 'UTC-5 (EST)'
  });

  const [newVipContact, setNewVipContact] = useState('');

  const handleEmailVolumeChange = (value: number) => {
    setPreferences(prev => ({ ...prev, emailVolume: value }));
  };

  const handleResponseUrgencyChange = (urgency: 'instant' | 'same-day' | '48h') => {
    setPreferences(prev => ({ ...prev, responseUrgency: urgency }));
  };

  const handleAddVipContact = () => {
    if (newVipContact.trim() && !preferences.vipContacts.includes(newVipContact.trim())) {
      setPreferences(prev => ({
        ...prev,
        vipContacts: [...prev.vipContacts, newVipContact.trim()]
      }));
      setNewVipContact('');
    }
  };

  const handleRemoveVipContact = (contact: string) => {
    setPreferences(prev => ({
      ...prev,
      vipContacts: prev.vipContacts.filter(c => c !== contact)
    }));
  };

  const handleContinue = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    router.push('/onboarding/preview');
  };

  const getVolumeLabel = (volume: number) => {
    if (volume < 50) return 'Light';
    if (volume < 150) return 'Moderate';
    if (volume < 300) return 'Heavy';
    return 'Very Heavy';
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
          Set Your Preferences
        </Typography>
        <Typography variant="body" className="text-xl text-gray-600 max-w-2xl mx-auto">
          Customize how Napoleon works for your specific needs and workflow.
        </Typography>
      </motion.div>

      <div className="space-y-8">
        {/* Email Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="w-6 h-6 text-primary-600" />
              <Typography variant="h3" className="text-xl font-semibold text-gray-900">
                Email Volume
              </Typography>
            </div>
            
            <div className="mb-4">
              <Typography variant="body" className="text-gray-600 mb-2">
                How many emails do you receive daily?
              </Typography>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">50</span>
                <span className="text-sm text-gray-500">500+</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={preferences.emailVolume}
                onChange={(e) => handleEmailVolumeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center mt-2">
                <Typography variant="body" className="text-sm text-gray-600">
                  {preferences.emailVolume} emails/day
                </Typography>
                <Typography variant="body" className="text-sm font-medium text-primary-600">
                  {getVolumeLabel(preferences.emailVolume)}
                </Typography>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* VIP Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Star className="w-6 h-6 text-primary-600" />
              <Typography variant="h3" className="text-xl font-semibold text-gray-900">
                VIP Contacts
              </Typography>
            </div>
            
            <Typography variant="body" className="text-gray-600 mb-4">
              Add contacts that should always be prioritized (boss, clients, family).
            </Typography>
            
            <div className="flex space-x-2 mb-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newVipContact}
                onChange={(e) => setNewVipContact(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddVipContact} disabled={!newVipContact.trim()}>
                Add
              </Button>
            </div>
            
            {preferences.vipContacts.length > 0 && (
              <div className="space-y-2">
                {preferences.vipContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <Typography variant="body" className="text-sm text-gray-700">
                      {contact}
                    </Typography>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveVipContact(contact)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Response Urgency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-primary-600" />
              <Typography variant="h3" className="text-xl font-semibold text-gray-900">
                Response Urgency
              </Typography>
            </div>
            
            <Typography variant="body" className="text-gray-600 mb-4">
              How quickly should AI prioritize responses?
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urgencyOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    preferences.responseUrgency === option.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleResponseUrgencyChange(option.id as any)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <option.icon className="w-5 h-5 text-primary-600" />
                    <Typography variant="body" className="font-semibold text-gray-900">
                      {option.label}
                    </Typography>
                  </div>
                  <Typography variant="body" className="text-sm text-gray-600">
                    {option.description}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Work Hours & Timezone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-primary-600" />
              <Typography variant="h3" className="text-xl font-semibold text-gray-900">
                Work Hours & Timezone
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="body" className="text-gray-600 mb-2">
                  Work Hours
                </Typography>
                <div className="flex space-x-2">
                  <Input
                    type="time"
                    value={preferences.workHours.start}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      workHours: { ...prev.workHours, start: e.target.value }
                    }))}
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <Input
                    type="time"
                    value={preferences.workHours.end}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      workHours: { ...prev.workHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Typography variant="body" className="text-gray-600 mb-2">
                  Timezone
                </Typography>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-burgundy focus:border-brand-burgundy"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Behavior Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-primary-50 rounded-2xl p-6"
        >
          <Typography variant="h3" className="text-xl font-bold text-gray-900 mb-4 text-center">
            AI Behavior Preview
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Mail className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <Typography variant="body" className="font-semibold text-gray-900 mb-1">
                Email Processing
              </Typography>
              <Typography variant="body" className="text-sm text-gray-600">
                {preferences.emailVolume} emails/day with {getVolumeLabel(preferences.emailVolume)} priority
              </Typography>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <Typography variant="body" className="font-semibold text-gray-900 mb-1">
                VIP Contacts
              </Typography>
              <Typography variant="body" className="text-sm text-gray-600">
                {preferences.vipContacts.length} contacts always prioritized
              </Typography>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <Typography variant="body" className="font-semibold text-gray-900 mb-1">
                Response Time
              </Typography>
              <Typography variant="body" className="text-sm text-gray-600">
                {urgencyOptions.find(o => o.id === preferences.responseUrgency)?.label} responses
              </Typography>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Button size="lg" onClick={handleContinue} className="px-8 py-3">
            Continue to Preview
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 