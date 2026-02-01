import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30",
    secondary: "bg-card border border-slate-600 text-slate-200 hover:bg-slate-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "bg-transparent text-slate-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </button>
  );
};