import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "executive" | "luxury" | "cartier" | "featured";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const baseClasses = "inline-block px-3 py-1 rounded-full text-xs font-medium";

  const variantClasses = {
    default: "border border-[#F5F5F5] bg-white text-black",
    executive: "border border-[#801B2B] bg-[#801B2B] text-white",
    luxury: "border border-[#F8F6F0] bg-[#F8F6F0] text-black",
    cartier: "border border-[#801B2B] bg-[#801B2B] text-white",
    featured:
      "border border-[#801B2B] bg-gradient-to-r from-white to-[#F8F6F0] text-[#801B2B]",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="badge"
    >
      {children}
    </span>
  );
};

export default Badge;
