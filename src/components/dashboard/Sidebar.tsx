'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Settings, RefreshCw, AlertCircle } from 'lucide-react';

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
    <div className={`bg-white border-r border-gray-200 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Typography variant="h2" className="text-lg font-bold text-black">
              Super Intelligence
            </Typography>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? '→' : '←'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant={activeTab === 'emails' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('emails')}
          >
            <Mail className="h-4 w-4 mr-3" />
            {!collapsed && (
              <>
                <span>Emails</span>
                {syncStatus.emailsCount > 0 && (
                  <Badge className="ml-auto">
                    {syncStatus.emailsCount}
                  </Badge>
                )}
              </>
            )}
          </Button>

          <Button
            variant={activeTab === 'messages' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('messages')}
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            {!collapsed && (
              <>
                <span>Messages</span>
                {workspaces.length > 0 && (
                  <Badge className="ml-auto">
                    {workspaces.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Sync Status */}
        {!collapsed && activeTab === 'emails' && (
          <Card className="mt-6 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">
                  Email Sync
                </Typography>
                <div className={`w-2 h-2 rounded-full ${syncStatus.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last sync:</span>
                  <span className="text-gray-900">{formatLastSync(syncStatus.lastSync)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Emails:</span>
                  <span className="text-gray-900">{syncStatus.emailsCount}</span>
                </div>
              </div>

              <Button
                onClick={onSyncEmails}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </Card>
        )}

        {/* Workspace Selection */}
        {!collapsed && activeTab === 'messages' && workspaces.length > 0 && (
          <Card className="mt-6 p-4">
            <Typography variant="body" className="font-medium mb-3">
              Workspaces
            </Typography>
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant={selectedWorkspace === workspace.id ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onWorkspaceChange(workspace.id)}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${workspace.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="truncate">{workspace.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Connection Status */}
        {!collapsed && (
          <Card className="mt-6 p-4">
            <Typography variant="body" className="font-medium mb-3">
              Connections
            </Typography>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gmail</span>
                <div className={`w-2 h-2 rounded-full ${syncStatus.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Slack</span>
                <div className={`w-2 h-2 rounded-full ${workspaces.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </Card>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {/* TODO: Navigate to settings */}}
        >
          <Settings className="h-4 w-4 mr-3" />
          {!collapsed && <span>Settings</span>}
        </Button>
      </div>
    </div>
  );
} 