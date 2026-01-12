'use client';

import { useEffect, useState, useRef } from 'react';
import { globalNodePositions } from './NeuralNetworkInteractive';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  'BUILD NOW',
  'SHIP FASTER',
  'ACCELERATE',
  'DEPLOY INSTANTLY',
  'CODE FEARLESSLY',
  'SCALE INFINITELY',
  'MOVE FORWARD',
  'BREAK BARRIERS',
  'PUSH LIMITS',
  'GO BEYOND',
  'EXECUTE RAPIDLY',
  'INNOVATE NOW',
];

export default function DynamicPhrase() {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({});
  const elementRef = useRef<HTMLDivElement>(null);

  // Pick random phrase on mount
  useEffect(() => {
    const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setCurrentPhrase(randomPhrase);
  }, []);

  // Update glow based on nearby nodes
  useEffect(() => {
    const updateGlow = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let closestDist = Infinity;
      let closestColor = '#00d4ff';
      let totalIntensity = 0;
      let colorIntensities: { [key: string]: number } = {};

      globalNodePositions.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const intensity = (200 - dist) / 200;
          totalIntensity += intensity;
          
          if (!colorIntensities[node.color]) {
            colorIntensities[node.color] = 0;
          }
          colorIntensities[node.color] += intensity;

          if (dist < closestDist) {
            closestDist = dist;
            closestColor = node.color;
          }
        }
      });

      if (totalIntensity > 0.1) {
        let dominantColor = closestColor;
        let maxIntensity = 0;
        Object.entries(colorIntensities).forEach(([color, intensity]) => {
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            dominantColor = color;
          }
        });

        const glowIntensity = Math.min(totalIntensity * 2, 1);
        const glowSize = 20 + (glowIntensity * 60);
        
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect();
          const closestNode = globalNodePositions.reduce((closest, node) => {
            const dx = node.x - (rect.left + rect.width / 2);
            const dy = node.y - (rect.top + rect.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < closest.dist ? { node, dist } : closest;
          }, { node: globalNodePositions[0], dist: Infinity });

          if (closestNode && closestNode.dist < 200) {
            const dx = closestNode.node.x - (rect.left + rect.width / 2);
            const dy = closestNode.node.y - (rect.top + rect.height / 2);
            const offsetX = Math.max(-4, Math.min(4, dx * 0.02));
            const offsetY = Math.max(-4, Math.min(4, dy * 0.02));

            setGlowStyle({
              filter: `
                drop-shadow(${offsetX}px ${offsetY}px ${glowSize * 0.5}px ${dominantColor})
                drop-shadow(${offsetX * 1.5}px ${offsetY * 1.5}px ${glowSize}px ${dominantColor})
                drop-shadow(0 0 ${glowSize * 0.8}px ${closestColor})
                drop-shadow(0 0 ${glowSize * 1.2}px rgba(255, 255, 255, ${glowIntensity * 0.3}))
              `,
              color: `${dominantColor}`,
              textShadow: `0 0 ${glowSize * 0.3}px ${dominantColor}`,
              transition: 'filter 0.1s ease-out, color 0.1s ease-out, text-shadow 0.1s ease-out',
            });
            return;
          }
        }

        setGlowStyle({
          filter: `
            drop-shadow(0 0 ${glowSize * 0.6}px ${dominantColor})
            drop-shadow(0 0 ${glowSize}px ${dominantColor})
            drop-shadow(0 0 ${glowSize * 1.2}px rgba(255, 255, 255, ${glowIntensity * 0.2}))
          `,
          color: `${dominantColor}`,
          textShadow: `0 0 ${glowSize * 0.3}px ${dominantColor}`,
          transition: 'filter 0.1s ease-out, color 0.1s ease-out, text-shadow 0.1s ease-out',
        });
      } else {
        setGlowStyle({
          filter: 'none',
          transition: 'filter 0.2s ease-out, color 0.2s ease-out, text-shadow 0.2s ease-out',
        });
      }
    };

    let animationId: number;
    const animate = () => {
      updateGlow();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {currentPhrase && (
        <motion.div
          key={currentPhrase}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          <h1
            ref={elementRef}
            className="text-6xl md:text-7xl lg:text-9xl font-black leading-[0.95] tracking-[-0.04em] text-gradient inline-block"
            style={glowStyle}
          >
            {currentPhrase}
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
