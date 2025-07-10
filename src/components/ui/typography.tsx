import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "body";
  children: React.ReactNode;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, as, variant = "p", children, ...props }, ref) => {
    const Component = as || variant;
    
    const baseStyles = "text-gray-900";
    const variantStyles = {
      h1: "text-4xl font-bold tracking-tight",
      h2: "text-3xl font-semibold tracking-tight",
      h3: "text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-base font-semibold tracking-tight",
      p: "text-base leading-7",
      span: "text-base",
      div: "text-base",
      body: "text-base leading-7",
    };
    
    return (
      <Component
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

// Specific typography components for convenience
export const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h1" as="h1" {...props} />
);
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h2" as="h2" {...props} />
);
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h3" as="h3" {...props} />
);
H3.displayName = "H3";

export const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h4" as="h4" {...props} />
);
H4.displayName = "H4";

export const H5 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h5" as="h5" {...props} />
);
H5.displayName = "H5";

export const H6 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="h6" as="h6" {...props} />
);
H6.displayName = "H6";

export const P = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="p" as="p" {...props} />
);
P.displayName = "P";

export const Span = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="span" as="span" {...props} />
);
Span.displayName = "Span";

export { Typography }; 