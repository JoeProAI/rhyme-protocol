'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface GlowCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'pink' | 'cyan' | 'purple' | 'green';
}

const colorClasses = {
  pink: 'neon-border-pink hover:shadow-neon-pink',
  cyan: 'neon-border-cyan hover:shadow-neon-cyan',
  purple: 'neon-border-purple hover:shadow-neon-purple',
  green: 'neon-border-green hover:shadow-neon-green',
};

const textColorClasses = {
  pink: 'text-neon-pink',
  cyan: 'text-neon-cyan',
  purple: 'text-neon-purple',
  green: 'text-neon-green',
};

export default function GlowCard({ title, description, icon: Icon, href, color }: GlowCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative p-6 glass rounded-xl border-2 transition-all duration-300 cursor-pointer ${colorClasses[color]}`}
      >
        {/* Icon */}
        <div className={`mb-4 ${textColorClasses[color]}`}>
          <Icon className="w-12 h-12 group-hover:animate-pulse" />
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-bold mb-2 ${textColorClasses[color]}`}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
          {description}
        </p>

        {/* Hover Indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
          <span>Explore</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl ${
          color === 'pink' ? 'bg-neon-pink' :
          color === 'cyan' ? 'bg-neon-cyan' :
          color === 'purple' ? 'bg-neon-purple' :
          'bg-neon-green'
        }`} />
      </motion.div>
    </Link>
  );
}