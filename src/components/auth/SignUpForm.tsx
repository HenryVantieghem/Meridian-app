'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Building, Users } from 'lucide-react';

interface SignUpFormProps {
  redirectUrl?: string;
  className?: string;
}

interface Persona {
  role: string;
  industry: string;
  communicationStyle: 'formal' | 'casual' | 'professional';
  priorities: string[];
}

const PERSONAS: Record<string, Persona> = {
  executive: {
    role: 'Executive',
    industry: 'Leadership',
    communicationStyle: 'professional',
    priorities: ['Strategic decisions', 'Team management', 'Stakeholder communication'],
  },
  manager: {
    role: 'Manager',
    industry: 'Management',
    communicationStyle: 'professional',
    priorities: ['Team coordination', 'Project oversight', 'Client relations'],
  },
  professional: {
    role: 'Professional',
    industry: 'General',
    communicationStyle: 'professional',
    priorities: ['Task management', 'Client communication', 'Documentation'],
  },
  entrepreneur: {
    role: 'Entrepreneur',
    industry: 'Startup',
    communicationStyle: 'casual',
    priorities: ['Business development', 'Investor relations', 'Team building'],
  },
};

export function SignUpForm({ redirectUrl = '/onboarding', className }: SignUpFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('professional');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          persona: selectedPersona,
        },
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError('Sign up failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'oauth_google' | 'oauth_microsoft') => {
    if (!isLoaded) return;

    setIsOAuthLoading(true);
    setError('');

    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'OAuth sign up failed.');
      setIsOAuthLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full max-w-md mx-auto', className)}
    >
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <Typography variant="h2" className="text-2xl font-bold text-gray-900">
            Join Meridian
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Create your account to get started
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              I'm a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PERSONAS).map(([key, persona]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPersona(key)}
                  className={cn(
                    'p-3 text-left border rounded-lg transition-all',
                    selectedPersona === key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {persona.role === 'Executive' && <Building className="h-4 w-4" />}
                    {persona.role === 'Manager' && <Users className="h-4 w-4" />}
                    {persona.role === 'Professional' && <User className="h-4 w-4" />}
                    {persona.role === 'Entrepreneur' && <Building className="h-4 w-4" />}
                    <span className="font-medium text-sm">{persona.role}</span>
                  </div>
                  <div className="text-xs text-gray-600">{persona.industry}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <Typography variant="body" className="text-red-700 text-sm">
                {error}
              </Typography>
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp('oauth_google')}
            disabled={isOAuthLoading}
            className="flex items-center justify-center space-x-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthSignUp('oauth_microsoft')}
            disabled={isOAuthLoading}
            className="flex items-center justify-center space-x-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.5 2.75h-8v8h8v-8zM11.5 13.25h-8v8h8v-8zM21.5 2.75h-8v8h8v-8zM21.5 13.25h-8v8h8v-8z"/>
            </svg>
            <span>Microsoft</span>
          </Button>
        </div>

        <div className="text-center">
          <Typography variant="body" className="text-gray-600">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Sign in
            </a>
          </Typography>
        </div>
      </Card>
    </motion.div>
  );
} 