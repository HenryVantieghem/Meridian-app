import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, children, onClick, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gray-200 bg-white shadow-sm",
          interactive && "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300",
          onClick && "cursor-pointer",
          className
        )}
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
              <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn(
          "p-6",
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