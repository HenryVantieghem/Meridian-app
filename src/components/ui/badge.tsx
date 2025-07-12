import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'executive' | 'luxury';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = "inline-block px-3 py-1 rounded-full text-xs font-medium";
  
  const variantClasses = {
    default: "border border-[#E5E4E2] bg-white text-black",
    executive: "border border-[#DC143C] bg-[#DC143C] text-white",
    luxury: "border border-[#E5E4E2] bg-[#E5E4E2] text-black",
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