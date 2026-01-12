'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  attractorX: number;
  attractorY: number;
}

// Gold flaked stars - blending white to gold with varying opacity
const STAR_BRIGHTNESS = [
  { main: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' }, // Bright gold
  { main: '#f5e6b3', glow: 'rgba(255, 215, 0, 0.6)' }, // Light gold
  { main: '#fffaf0', glow: 'rgba(255, 215, 0, 0.4)' }, // Cream white
  { main: '#fff9e6', glow: 'rgba(255, 215, 0, 0.3)' }, // Soft white-gold
  { main: 'rgba(255, 255, 255, 0.8)', glow: 'rgba(255, 215, 0, 0.2)' }, // White with gold glow
  { main: 'rgba(255, 247, 230, 0.9)', glow: 'rgba(255, 215, 0, 0.5)' }, // Pale gold
];

const ParticleText: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Mouse tracking - global on window so it works everywhere
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize star nodes with subtle movement
    const initNodes = () => {
      const nodeCount = 120;
      for (let i = 0; i < nodeCount; i++) {
        const brightness = STAR_BRIGHTNESS[Math.floor(Math.random() * STAR_BRIGHTNESS.length)];
        const attractorX = Math.random() * canvas.width;
        const attractorY = Math.random() * canvas.height;
        
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2, // Slower movement
          vy: (Math.random() - 0.5) * 0.2,
          radius: Math.random() * 2 + 1.5, // Larger gold flakes
          color: brightness.main,
          glowColor: brightness.glow,
          attractorX,
          attractorY,
        });
      }
    };
    initNodes();

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      // Fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Subtle mouse attraction
        const mouseDx = mouseRef.current.x - node.x;
        const mouseDy = mouseRef.current.y - node.y;
        const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDist < 200 && mouseDist > 0) {
          const mouseForce = (200 - mouseDist) / 200;
          node.vx += (mouseDx / mouseDist) * mouseForce * 0.15; // Much gentler
          node.vy += (mouseDy / mouseDist) * mouseForce * 0.15;
        }

        // Gravitational attractor (very weak pull back)
        const attractorDx = node.attractorX - node.x;
        const attractorDy = node.attractorY - node.y;
        node.vx += attractorDx * 0.0002;
        node.vy += attractorDy * 0.0002;

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;

        // Damping
        node.vx *= 0.95;
        node.vy *= 0.95;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Draw gold flaked star with sleek glow
        ctx.shadowBlur = 12; // Enhanced glow for gold flakes
        ctx.shadowColor = node.glowColor;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw subtle gold-tinted connections between nearby stars
      ctx.lineWidth = 0.4;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const n1 = nodesRef.current[i];
          const n2 = nodesRef.current[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (120 - dist) / 120;
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.12})`; // Subtle gold lines
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{
        background: 'radial-gradient(ellipse at top, #1a1000 0%, #0a0600 30%, #000000 70%, #000000 100%)',
      }}
    />
  );
};

export default ParticleText;
