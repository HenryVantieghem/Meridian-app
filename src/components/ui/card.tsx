import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'executive' | 'luxury' | 'cartier' | 'featured';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, children, onClick, interactive = false, variant = 'default', ...props }, ref) => {
    const baseClasses = cn(
      "rounded-md border bg-white shadow-sm",
      variant === 'executive' && "border-[#F5F5F5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#E5E5E5]",
      variant === 'luxury' && "border-[#F5F5F5] shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-8",
      variant === 'cartier' && "border-[#F5F5F5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#E5E5E5]",
      variant === 'featured' && "border-[#801B2B] shadow-[0_4px_16px_rgba(0,0,0,0.08)] bg-gradient-to-br from-white to-[#F8F6F0] transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_8px_32px_rgba(128,27,43,0.15)]",
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
                variant === 'executive' || variant === 'cartier' ? "text-black font-serif text-xl" : "text-gray-900 text-lg",
                variant === 'featured' ? "text-black font-serif text-xl" : ""
              )}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={cn(
                "text-sm",
                variant === 'executive' || variant === 'cartier' ? "text-[#4A4A4A]" : "text-gray-500",
                variant === 'featured' ? "text-[#4A4A4A]" : ""
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