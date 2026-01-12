import React from 'react';
import Link from 'next/link';

interface AppCardProps {
  title: string;
  description: string;
  status?: string;
  href?: string;
  onClick?: () => void;
}

const AppCard: React.FC<AppCardProps> = ({ 
  title, 
  description, 
  status = 'ONLINE',
  href, 
  onClick,
}) => {
  const Content = () => (
    <div className="
      relative p-6 h-full
      bg-[var(--card-bg)] backdrop-blur-md
      border-2 border-[var(--border)]
      rounded-lg transition-all duration-300
      hover:border-[var(--primary)]
      hover:shadow-[0_0_20px_rgba(212,160,23,0.3)]
      group
    ">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">
          {title}
        </h3>
        
        <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-auto">
          {description}
        </p>
        
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="mr-2 text-[var(--text-muted)]">STATUS:</span>
            <span className={status === 'ONLINE' ? 'text-[var(--primary)]' : status === 'BETA' ? 'text-yellow-400' : 'text-[var(--text-muted)]'}>
              {status}
            </span>
          </div>
          <span className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
            Launch
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <Content />
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer h-full">
      <Content />
    </div>
  );
};

export default AppCard;
