"use client";
import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfidenceMeter } from "@/components/ai/ConfidenceMeter";
import { ReplyGenerator, GeneratedReply, ReplyTone } from "@/lib/ai/reply-generator";
import { EmailMessage } from "@/lib/email/fetcher";
import { Loader2, Undo2, Redo2, Send, Save, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyComposerProps {
  email: EmailMessage;
  contextEmails?: EmailMessage[];
  userName?: string;
  onSend: (reply: string) => Promise<void>;
  onSaveDraft?: (reply: string) => Promise<void>;
  onDiscard?: () => void;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  email,
  contextEmails = [],
  userName,
  onSend,
  onSaveDraft,
  onDiscard,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<GeneratedReply[]>([]);
  const [selected, setSelected] = useState(0);
  const [editorValue, setEditorValue] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0.7);
  const [tone, setTone] = useState<ReplyTone>("neutral");
  const [feedback, setFeedback] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Fetch AI replies
  const fetchReplies = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const generator = new ReplyGenerator();
      const result = await generator.generateReplies(email, {
        tone,
        contextEmails,
        userName,
        maxReplies: 3,
      });
      setReplies(result.replies);
      setSelected(0);
      setEditorValue(result.replies[0]?.text || "");
      setConfidence(result.replies[0]?.confidence || 0.7);
      setFeedback(result.success ? null : "AI fallback: using template reply.");
    } catch (err: unknown) {
      setError("Failed to generate reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Undo/redo logic
  const handleUndo = () => {
    if (undoStack.length > 0) {
      setRedoStack([editorValue, ...redoStack]);
      setEditorValue(undoStack[0]);
      setUndoStack(undoStack.slice(1));
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      setUndoStack([editorValue, ...undoStack]);
      setEditorValue(redoStack[0]);
      setRedoStack(redoStack.slice(1));
    }
  };
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUndoStack([editorValue, ...undoStack]);
    setEditorValue(e.target.value);
    setRedoStack([]);
  };

  // On mount, fetch AI replies
  React.useEffect(() => {
    fetchReplies();
    // eslint-disable-next-line
  }, [email.id, tone]);

  // When user selects a different AI reply
  const handleSelectReply = (idx: number) => {
    setSelected(idx);
    setEditorValue(replies[idx]?.text || "");
    setConfidence(replies[idx]?.confidence || 0.7);
  };

  // Send/save/discard actions
  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSend(editorValue);
      setFeedback("Reply sent. AI is learning from your edits.");
    } catch (err: unknown) {
      setError("Failed to send reply.");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!onSaveDraft) return;
    setLoading(true);
    setError(null);
    try {
      await onSaveDraft(editorValue);
      setFeedback("Draft saved.");
    } catch (err: unknown) {
      setError("Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };
  const handleDiscard = () => {
    setEditorValue("");
    setUndoStack([]);
    setRedoStack([]);
    setReplies([]);
    setFeedback("Reply discarded.");
    if (onDiscard) onDiscard();
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" /> AI Reply Composer
        </span>
        <Button variant="outline" size="sm" onClick={fetchReplies} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Regenerate
        </Button>
      </div>
      <div className="mb-4">
        <ConfidenceMeter
          value={confidence}
          onChange={setConfidence}
          showTone
          onToneChange={t => setTone(t as ReplyTone)}
          disabled={loading}
        />
      </div>
      <div className="flex gap-2 mb-2">
        {replies.map((r, i) => (
          <Button
            key={i}
            variant={i === selected ? "default" : "outline"}
            size="sm"
            className={cn("transition-all", i === selected ? "border-[#D4AF37] text-black" : "")}
            onClick={() => handleSelectReply(i)}
            disabled={loading}
          >
            Option {i + 1}
          </Button>
        ))}
      </div>
      <div className="mb-2">
        <textarea
          ref={editorRef}
          value={editorValue}
          onChange={handleEditorChange}
          rows={6}
          className="w-full rounded-lg border border-gray-300 p-3 font-sans text-gray-900 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none transition-all resize-vertical bg-white"
          disabled={loading}
          aria-label="Edit reply"
        />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={handleUndo} disabled={undoStack.length === 0 || loading} aria-label="Undo">
          <Undo2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRedo} disabled={redoStack.length === 0 || loading} aria-label="Redo">
          <Redo2 className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex gap-3 mt-2">
        <Button onClick={handleSend} disabled={loading || !editorValue.trim()} className="bg-[#D4AF37] text-black hover:bg-[#FFD700]">
          <Send className="w-4 h-4 mr-1" /> Send
        </Button>
        {onSaveDraft && (
          <Button onClick={handleSave} disabled={loading || !editorValue.trim()} variant="outline">
            <Save className="w-4 h-4 mr-1" /> Save Draft
          </Button>
        )}
        <Button onClick={handleDiscard} disabled={loading} variant="outline">
          <Trash2 className="w-4 h-4 mr-1" /> Discard
        </Button>
      </div>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-gray-500"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Generating reply...
          </motion.div>
        )}
      </AnimatePresence>
      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      {feedback && <div className="mt-3 text-[#D4AF37] text-sm font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" /> {feedback}</div>}
    </Card>
  );
};

export default ReplyComposer; 