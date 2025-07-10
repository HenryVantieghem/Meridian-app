'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Users, 
  FolderOpen, 
  Inbox,
  Settings,
  LogOut,
  Bell,
  Search,
  X
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  active?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: 'digest', label: 'Daily Digest', icon: Mail, count: 12, active: true },
  { id: 'people', label: 'People', icon: Users, count: 8 },
  { id: 'projects', label: 'Projects', icon: FolderOpen, count: 5 },
  { id: 'all', label: 'All Emails', icon: Inbox, count: 156 }
];

export function Sidebar({ onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('digest');

  const handleNavigationClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Typography variant="body" className="text-white font-bold">
                M
              </Typography>
            </div>
            <Typography variant="h3" className="text-xl font-bold text-gray-900">
              Meridian
            </Typography>
          </div>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* User Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <Typography variant="body" className="text-white font-semibold text-lg">
              S
            </Typography>
          </div>
          <div>
            <Typography variant="body" className="font-semibold text-gray-900">
              Good morning, Sarah
            </Typography>
            <Typography variant="body" className="text-sm text-gray-600">
              CEO at TechFlow Inc.
            </Typography>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant={activeItem === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start space-x-3 h-12 ${
                  activeItem === item.id 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => handleNavigationClick(item.id)}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeItem === item.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="pt-2 border-t border-gray-200"
        >
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 