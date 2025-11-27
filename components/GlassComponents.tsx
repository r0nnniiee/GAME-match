import React from 'react';

// Frosted Glass Card
export interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl ${className}`}>
    {children}
  </div>
);

// Glass Button with Gradient Border/Fill
export const GlassButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-gamer tracking-wider font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border border-white/10",
    secondary: "bg-white/5 border border-white/20 hover:bg-white/10 text-white",
    danger: "bg-red-500/20 border border-red-500/50 text-red-100 hover:bg-red-500/30",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};

// Glass Input
export const GlassInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-black/30 transition-all ${props.className}`}
  />
);

export const GlassSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select 
            {...props}
            className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/50 appearance-none ${props.className}`}
        >
            {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);