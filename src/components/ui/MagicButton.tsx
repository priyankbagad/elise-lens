'use client';

import React from 'react';
import Link from 'next/link';

interface MagicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}

export function MagicButton({
  children, onClick, className = '',
  type = 'button', disabled, variant = 'primary',
}: MagicButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#7C3AED_0%,#A855F7_50%,#7C3AED_100%)]" />
      <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-6 py-1 text-sm font-medium backdrop-blur-3xl gap-2 transition-all ${variant === 'primary' ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]' : 'bg-white text-[#7C3AED] hover:bg-[#F5F3FF]'}`}>
        {children}
      </span>
    </button>
  );
}

export function MagicLink({
  children, href = '/', className = '', variant = 'primary',
}: MagicButtonProps) {
  return (
    <Link
      href={href}
      className={`relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#7C3AED_0%,#A855F7_50%,#7C3AED_100%)]" />
      <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-6 py-1 text-sm font-medium backdrop-blur-3xl gap-2 transition-all ${variant === 'primary' ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]' : 'bg-white text-[#7C3AED] hover:bg-[#F5F3FF]'}`}>
        {children}
      </span>
    </Link>
  );
}
