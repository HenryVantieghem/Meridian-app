import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span
    className={`inline-block px-2 py-0.5 border border-[#D4AF37] bg-white text-black rounded-full text-xs font-medium ${className}`}
    role="status"
    aria-label="badge"
  >
    {children}
  </span>
);

export default Badge; 