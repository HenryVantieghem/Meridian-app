import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'executive' | 'luxury';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, children, onClick, interactive = false, variant = 'default', ...props }, ref) => {
    const baseClasses = cn(
      "rounded-md border bg-white shadow-sm",
      variant === 'executive' && "border-[#E5E4E2] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-[rgba(220,20,60,0.2)]",
      variant === 'luxury' && "border-[#E5E4E2] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-8",
      variant === 'default' && "border-gray-200",
      interactive && "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300",
      onClick && "cursor-pointer",
      className
    );

    return (
      <div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        {...props}
      >
        {(title || subtitle) && (
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            {title && (
              <h3 className={cn(
                "font-semibold leading-none tracking-tight",
                variant === 'executive' ? "text-black font-serif text-xl" : "text-gray-900 text-lg"
              )}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={cn(
                "text-sm",
                variant === 'executive' ? "text-[#36454F]" : "text-gray-500"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn(
          variant === 'luxury' ? "p-0" : "p-6",
          !title && !subtitle && "pt-6"
        )}>
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card }; 