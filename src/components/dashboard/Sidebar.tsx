'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Settings, RefreshCw, Crown } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  activeTab: 'emails' | 'messages';
  onTabChange: (tab: 'emails' | 'messages') => void;
  selectedWorkspace: string;
  workspaces: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  onWorkspaceChange: (workspaceId: string) => void;
  syncStatus: {
    lastSync: Date | null;
    emailsCount: number;
    isActive: boolean;
  };
  onSyncEmails: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  selectedWorkspace,
  workspaces,
  onWorkspaceChange,
  syncStatus,
  onSyncEmails,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [portal, setPortal] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/stripe/portal');
        if (response.ok) {
          const data = await response.json();
          setPortal(data.url);
        }
      } catch (error) {
        console.error('Failed to fetch billing portal URL:', error);
      }
    })();
  }, []);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`bg-white border-r border-[#F5F5F5] flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#F5F5F5]">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-[#801B2B]" />
              <h2 className="text-subhead-cartier text-black font-serif">
                Napoleon
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-[#4A4A4A] hover:text-[#801B2B]"
          >
            {collapsed ? '→' : '←'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="nav-executive">
          <Button
            variant={activeTab === 'emails' ? 'cartier' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'emails' ? 'nav-item active' : 'nav-item'}`}
            onClick={() => onTabChange('emails')}
          >
            <Mail className="h-4 w-4 mr-3" />
            {!collapsed && (
              <>
                <span className="font-medium">Strategic Communications</span>
                {syncStatus.emailsCount > 0 && (
                  <Badge className="ml-auto bg-[#801B2B] text-white">
                    {syncStatus.emailsCount}
                  </Badge>
                )}
              </>
            )}
          </Button>

          <Button
            variant={activeTab === 'messages' ? 'cartier' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'messages' ? 'nav-item active' : 'nav-item'}`}
            onClick={() => onTabChange('messages')}
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            {!collapsed && (
              <>
                <span className="font-medium">Executive Messaging</span>
                {workspaces.length > 0 && (
                  <Badge className="ml-auto bg-[#801B2B] text-white">
                    {workspaces.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Sync Status */}
        {!collapsed && activeTab === 'emails' && (
          <Card variant="cartier" className="mt-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-subhead-cartier text-black font-serif">Communication Sync</h3>
                <div className={`w-3 h-3 rounded-full ${syncStatus.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-body-cartier">
                  <span className="text-[#4A4A4A]">Last synchronization:</span>
                  <span className="text-black font-medium">{formatLastSync(syncStatus.lastSync)}</span>
                </div>
                
                <div className="flex items-center justify-between text-body-cartier">
                  <span className="text-[#4A4A4A]">Communications:</span>
                  <span className="text-black font-medium">{syncStatus.emailsCount}</span>
                </div>
              </div>

              <Button
                onClick={onSyncEmails}
                variant="cartier-subtle"
                size="cartier"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchronize Now
              </Button>
            </div>
          </Card>
        )}

        {/* Workspace Selection */}
        {!collapsed && activeTab === 'messages' && workspaces.length > 0 && (
          <Card variant="cartier" className="mt-8">
            <h3 className="text-subhead-cartier text-black font-serif mb-4">
              Executive Workspaces
            </h3>
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant={selectedWorkspace === workspace.id ? 'cartier' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start ${selectedWorkspace === workspace.id ? 'nav-item active' : 'nav-item'}`}
                  onClick={() => onWorkspaceChange(workspace.id)}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${workspace.isActive ? 'bg-green-500' : 'bg-[#F8F6F0]'}`} />
                  <span className="truncate font-medium">{workspace.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Connection Status */}
        {!collapsed && (
          <Card variant="cartier" className="mt-8">
            <h3 className="text-subhead-cartier text-black font-serif mb-4">
              Strategic Connections
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-cartier text-[#4A4A4A]">Gmail Integration</span>
                <div className={`w-3 h-3 rounded-full ${syncStatus.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-cartier text-[#4A4A4A]">Slack Integration</span>
                <div className={`w-3 h-3 rounded-full ${workspaces.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </Card>
        )}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-[#F5F5F5]">
        <Button
          variant="ghost"
          className="w-full justify-start nav-item"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="h-4 w-4 mr-3" />
          {!collapsed && <span className="font-medium">Strategic Settings</span>}
        </Button>
        
        {portal && (
          <Link
            href={portal}
            className="mt-6 inline-block rounded-md bg-brand-burgundy px-4 py-2 text-white transition hover:opacity-90"
          >
            Manage&nbsp;subscription
          </Link>
        )}
      </div>
    </div>
  );
} 