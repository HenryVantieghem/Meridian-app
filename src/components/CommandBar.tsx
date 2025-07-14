'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Sparkles, X } from 'lucide-react';

interface CommandBarProps {
  onCommand?: (command: string) => void;
  className?: string;
}

export function CommandBar({ onCommand, className = '' }: CommandBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command bar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onCommand) {
        onCommand(command);
      }
      
      setCommand('');
      setIsOpen(false);
    } catch (error) {
      console.error('Command processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickCommands = [
    { label: 'Prioritize emails', command: 'Prioritize my inbox' },
    { label: 'Generate reply', command: 'Draft a professional reply' },
    { label: 'Schedule meeting', command: 'Find time for a meeting' },
    { label: 'Summarize thread', command: 'Summarize this conversation' },
  ];

  return (
    <>
      {/* Floating Command Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-black text-white hover:bg-brand-burgundy shadow-lg"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Command Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-burgundy rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cartier-900">Ask Napoleon</h3>
                      <p className="text-sm text-cartier-600">AI-powered command center</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-cartier-600 hover:text-cartier-900"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Commands */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-cartier-700">Quick Commands</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickCommands.map((quickCmd, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCommand(quickCmd.command)}
                        className="p-3 text-left rounded-lg border border-cartier-200 hover:border-brand-burgundy hover:bg-brand-burgundy hover:bg-opacity-5 transition-all duration-200"
                      >
                        <p className="text-sm font-medium text-cartier-900">{quickCmd.label}</p>
                        <p className="text-xs text-cartier-600 truncate">{quickCmd.command}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Command Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Input
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="Ask Napoleon anything... (e.g., 'Prioritize my inbox', 'Draft a reply')"
                      className="pr-12 focus:ring-brand-burgundy"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <kbd className="hidden sm:inline-flex items-center rounded border border-cartier-200 bg-cartier-50 px-2 py-1 text-xs font-mono text-cartier-600">
                        ⌘K
                      </kbd>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!command.trim() || isProcessing}
                        className="w-8 h-8 p-0 bg-brand-burgundy hover:bg-brand-burgundy/90"
                      >
                        {isProcessing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Tips */}
                <div className="text-xs text-cartier-500 space-y-1">
                                        <p>💡 Try: &quot;Summarize my unread emails&quot; or &quot;Find urgent messages&quot;</p>
                      <p>⌨️ Use keyboard shortcuts: E=Done, R=Reply, S=Snooze</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 