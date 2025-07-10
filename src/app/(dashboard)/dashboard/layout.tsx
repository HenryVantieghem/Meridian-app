'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ContextPanel } from '@/components/dashboard/ContextPanel';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleContextPanel = () => setContextPanelOpen(!contextPanelOpen);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:relative z-50 w-80 lg:w-1/5 h-full bg-white border-r border-gray-200 shadow-lg lg:shadow-none"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">Meridian</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleContextPanel}
              className="hidden lg:flex"
            >
              {contextPanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex min-h-0">
          {/* Center Panel */}
          <div className="flex-1 lg:w-3/5 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </div>

          {/* Right Context Panel */}
          <AnimatePresence>
            {contextPanelOpen && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="hidden lg:block w-80 lg:w-1/5 bg-white border-l border-gray-200 overflow-y-auto"
              >
                <ContextPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Context Panel */}
      <AnimatePresence>
        {contextPanelOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:hidden right-0 top-0 z-50 w-80 h-full bg-white border-l border-gray-200 shadow-lg"
          >
            <div className="p-4 border-b border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContextPanelOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ContextPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 