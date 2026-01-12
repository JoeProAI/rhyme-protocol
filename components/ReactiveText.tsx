'use client';

import { useEffect, useState, useRef } from 'react';
import { globalNodePositions } from './NeuralNetworkInteractive';

interface ReactiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';
}

export default function ReactiveText({ children, className = '', as: Tag = 'span' }: ReactiveTextProps) {
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({});
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateGlow = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Find closest nodes and calculate intensity
      let closestDist = Infinity;
      let closestColor = '#00d4ff';
      let totalIntensity = 0;
      let colorIntensities: { [key: string]: number } = {};

      globalNodePositions.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if node is within range (200px radius)
        if (dist < 200) {
          const intensity = (200 - dist) / 200;
          totalIntensity += intensity;
          
          // Track color intensities
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

      // Only apply glow if nodes are nearby
      if (totalIntensity > 0.1) {
        // Find dominant color
        let dominantColor = closestColor;
        let maxIntensity = 0;
        Object.entries(colorIntensities).forEach(([color, intensity]) => {
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            dominantColor = color;
          }
        });

        // Calculate glow based on proximity - MUCH MORE DRAMATIC
        const glowIntensity = Math.min(totalIntensity * 2, 1);
        const glowSize = 20 + (glowIntensity * 60); // Bigger glow range
        
        // Holographic color shift - add complementary colors
        const holographicColors = [
          dominantColor,
          closestColor,
          '#ffffff' // Add white for holographic shimmer
        ];
        
        // Create directional shadow based on closest node position
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

            // Multi-layer holographic glow
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

        // Default glow without direction - still dramatic
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
        // No nodes nearby - keep original color
        setGlowStyle({
          filter: 'none',
          transition: 'filter 0.2s ease-out, color 0.2s ease-out, text-shadow 0.2s ease-out',
        });
      }
    };

    // Update on animation frame for smooth reactivity
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
    <Tag ref={elementRef as any} className={className} style={glowStyle}>
      {children}
    </Tag>
  );
}
