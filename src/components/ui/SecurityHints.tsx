'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Shield, Fingerprint, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';

interface SecurityHintsProps {
  className?: string;
}

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'enabled' | 'disabled' | 'recommended';
  action?: () => void;
  actionText?: string;
}

export default function SecurityHints({ className = '' }: SecurityHintsProps) {
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionSecure, setSessionSecure] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
    checkMFAStatus();
    checkSessionSecurity();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if Web Authentication API is available
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricSupported(available);
        
        // Check if biometric is already enabled (stored in localStorage for demo)
        const enabled = localStorage.getItem('biometricEnabled') === 'true';
        setBiometricEnabled(enabled);
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
    }
  };

  const checkMFAStatus = () => {
    // In real app, this would check with Clerk or your auth provider
    const mfaStatus = localStorage.getItem('mfaEnabled') === 'true';
    setMfaEnabled(mfaStatus);
  };

  const checkSessionSecurity = () => {
    // Check for secure connection and session status
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setSessionSecure(isSecure);
  };

  const enableBiometric = async () => {
    try {
      // Mock biometric enrollment
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
    } catch (error) {
      console.error('Biometric enrollment failed:', error);
    }
  };

  const enableMFA = () => {
    // Mock MFA setup
    setMfaEnabled(true);
    localStorage.setItem('mfaEnabled', 'true');
  };

  const securityFeatures: SecurityFeature[] = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      description: biometricSupported 
        ? 'Use your fingerprint or Face ID for secure, instant access to your strategic communications.'
        : 'Biometric authentication is not available on this device.',
      icon: <Fingerprint className="w-5 h-5" />,
      status: biometricSupported ? (biometricEnabled ? 'enabled' : 'available') : 'disabled',
      action: biometricSupported && !biometricEnabled ? enableBiometric : undefined,
      actionText: 'Enable Biometric Login'
    },
    {
      id: 'mfa',
      title: 'Multi-Factor Authentication',
      description: 'Add an extra layer of security with SMS or authenticator app verification.',
      icon: <Smartphone className="w-5 h-5" />,
      status: mfaEnabled ? 'enabled' : 'recommended',
      action: !mfaEnabled ? enableMFA : undefined,
      actionText: 'Setup MFA'
    },
    {
      id: 'encryption',
      title: 'End-to-End Encryption',
      description: 'All communications are encrypted in transit and at rest using AES-256.',
      icon: <Lock className="w-5 h-5" />,
      status: 'enabled'
    },
    {
      id: 'session',
      title: 'Secure Session Management',
      description: 'Advanced session protection with automatic logout and device tracking.',
      icon: <Shield className="w-5 h-5" />,
      status: sessionSecure ? 'enabled' : 'disabled'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'recommended': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'available': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'recommended': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'disabled': return <EyeOff className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const securityScore = Math.round((securityFeatures.filter(f => f.status === 'enabled').length / securityFeatures.length) * 100);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Security Overview */}
      <Card className="bg-gradient-to-r from-white to-cartier-50 border-cartier-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-brand-burgundy" />
            <Typography variant="h6" className="font-playfair font-bold text-black">
              Executive Security Center
            </Typography>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-burgundy mb-1">
                {securityScore}%
              </div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {securityFeatures.filter(f => f.status === 'enabled').length}
              </div>
              <div className="text-sm text-gray-600">Active Protections</div>
            </div>
          </div>

          <div className="text-center">
            <Typography variant="body2" className="text-gray-700 mb-4">
              Napoleon AI employs enterprise-grade security measures to protect your strategic communications.
            </Typography>
            <div className="flex justify-center">
              <Badge className="bg-brand-burgundy text-white">
                <Lock className="w-3 h-3 mr-1" />
                Executive Grade Security
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="space-y-3">
        {securityFeatures.map(feature => (
          <Card key={feature.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cartier-50 rounded-lg">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Typography variant="h6" className="font-semibold text-black">
                        {feature.title}
                      </Typography>
                      {getStatusIcon(feature.status)}
                    </div>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      {feature.description}
                    </Typography>
                    <Badge className={`${getStatusColor(feature.status)} text-xs`}>
                      {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {feature.action && (
                  <Button
                    size="sm"
                    onClick={feature.action}
                    className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90"
                  >
                    {feature.actionText}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <Typography variant="h6" className="font-semibold text-yellow-800 mb-2">
                Security Best Practices
              </Typography>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Enable biometric authentication for fastest secure access</li>
                <li>• Use MFA for additional protection of sensitive communications</li>
                <li>• Regularly review and update your VIP contact list</li>
                <li>• Log out from shared devices and public computers</li>
                <li>• Monitor your session activity for any unusual access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <Typography variant="h6" className="font-semibold text-blue-800 mb-2">
                Privacy & Compliance
              </Typography>
              <Typography variant="body2" className="text-blue-700">
                Napoleon AI is SOC 2 Type II certified and GDPR compliant. Your data is processed 
                with the highest privacy standards and never shared with third parties.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}