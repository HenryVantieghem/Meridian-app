"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const confidenceLabels = [
  { min: 0, max: 0.2, text: "Very Uncertain" },
  { min: 0.2, max: 0.4, text: "Needs Review" },
  { min: 0.4, max: 0.6, text: "Somewhat Confident" },
  { min: 0.6, max: 0.8, text: "Confident" },
  { min: 0.8, max: 1, text: "Very Confident" },
];

const toneLabels = [
  { value: 0, label: "Concise" },
  { value: 0.25, label: "Formal" },
  { value: 0.5, label: "Neutral" },
  { value: 0.75, label: "Friendly" },
  { value: 1, label: "Custom" },
];

export interface ConfidenceMeterProps {
  value: number; // 0-1
  onChange: (value: number) => void;
  disabled?: boolean;
  showTone?: boolean;
  onToneChange?: (tone: string) => void;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  value,
  onChange,
  disabled,
  showTone = false,
  onToneChange,
}) => {
  // Map slider value to label
  const label =
    confidenceLabels.find((l) => value >= l.min && value < l.max)?.text ||
    "Confident";

  // Tone analog control
  const [toneValue, setToneValue] = React.useState(0.5);
  React.useEffect(() => {
    if (showTone && onToneChange) {
      const tone =
        toneValue < 0.15
          ? "concise"
          : toneValue < 0.4
            ? "formal"
            : toneValue < 0.65
              ? "neutral"
              : toneValue < 0.9
                ? "friendly"
                : "custom";
      onToneChange(tone);
    }
  }, [toneValue, showTone, onToneChange]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500">AI Confidence</span>
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)",
            color: "#000",
          }}
        >
          {label}
        </motion.div>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={[value]}
        onValueChange={([v]: [number]) => onChange(v)}
        disabled={disabled}
        className="w-full"
        aria-label="AI Confidence"
      />
      <AnimatePresence>
        {showTone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center mt-2"
          >
            <span className="text-xs font-medium text-gray-500 mb-1">
              AI Tone
            </span>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[toneValue]}
              onValueChange={([v]: [number]) => setToneValue(v)}
              className="w-full"
              aria-label="AI Tone"
            />
            <div className="flex justify-between w-full mt-1 text-xs text-gray-500">
              {toneLabels.map((t) => (
                <span
                  key={t.value}
                  className={cn(
                    "",
                    Math.abs(toneValue - t.value) < 0.13
                      ? "font-bold text-[#D4AF37]"
                      : "",
                  )}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfidenceMeter;
