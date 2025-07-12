import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: "hero" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "body" | "body-large" | "small" | "caption";
  children: React.ReactNode;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, as, variant = "p", children, ...props }, ref) => {
    const Component = as || variant;
    
    const baseStyles = "text-black";
    const variantStyles = {
      hero: "text-hero font-serif font-bold text-black leading-tight tracking-tight",
      h1: "text-h1 font-serif font-semibold text-black leading-tight",
      h2: "text-h2 font-serif font-semibold text-black leading-tight",
      h3: "text-h3 font-sans font-semibold text-black leading-tight",
      h4: "text-xl font-sans font-semibold text-black leading-tight",
      h5: "text-lg font-sans font-semibold text-black leading-tight",
      h6: "text-base font-sans font-semibold text-black leading-tight",
      p: "text-body font-sans text-[#36454F] leading-relaxed",
      span: "text-body font-sans text-[#36454F]",
      div: "text-body font-sans text-[#36454F]",
      body: "text-body font-sans text-[#36454F] leading-relaxed",
      "body-large": "text-body-large font-sans text-[#36454F] leading-relaxed",
      small: "text-small font-sans text-[#36454F] leading-relaxed",
      caption: "text-caption font-sans text-[#36454F] uppercase tracking-wide",
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
export const Hero = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="hero" as="h1" {...props} />
);
Hero.displayName = "Hero";

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

export const BodyLarge = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="body-large" as="p" {...props} />
);
BodyLarge.displayName = "BodyLarge";

export const Small = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="small" as="p" {...props} />
);
Small.displayName = "Small";

export const Caption = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  (props, ref) => <Typography ref={ref} variant="caption" as="p" {...props} />
);
Caption.displayName = "Caption";

export { Typography }; 