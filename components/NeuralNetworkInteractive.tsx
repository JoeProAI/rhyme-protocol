'use client';

import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
}

interface Attractor {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
}

const COLORS = [
  { main: '#00d4ff', glow: 'rgba(0, 212, 255' }, // Cyan
  { main: '#0066ff', glow: 'rgba(0, 102, 255' }, // Blue
  { main: '#a855f7', glow: 'rgba(168, 85, 247' }, // Purple
  { main: '#ec4899', glow: 'rgba(236, 72, 153' }, // Pink
  { main: '#10b981', glow: 'rgba(16, 185, 129' }, // Green
  { main: '#f59e0b', glow: 'rgba(245, 158, 11' }, // Orange
];

// Export node positions for text reactivity
export let globalNodePositions: Node[] = [];

export default function NeuralNetworkInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nodesRef = useRef<Node[]>([]);
  const attractorsRef = useRef<Attractor[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize smaller, more numerous nodes - ALWAYS RANDOMIZE on each mount
    // This makes the network different every time you load the page
    nodesRef.current = [];
    for (let i = 0; i < 150; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      nodesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.8, // Smaller: 0.8-2.3px
        color: color.main,
        glowColor: color.glow,
      });
    }

    // Initialize gravitational attractors - ALWAYS RANDOMIZE
    attractorsRef.current = [];
    for (let i = 0; i < 5; i++) {
      attractorsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        strength: Math.random() * 0.5 + 0.3,
      });
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 16, 48, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const attractors = attractorsRef.current;

      // Update attractors - move towards target and pick new targets
      attractors.forEach((attractor) => {
        const dx = attractor.targetX - attractor.x;
        const dy = attractor.targetY - attractor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Move towards target
        attractor.x += dx * 0.001;
        attractor.y += dy * 0.001;

        // If close to target, pick new random target
        if (dist < 50) {
          attractor.targetX = Math.random() * canvas.width;
          attractor.targetY = Math.random() * canvas.height;
        }
      });

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Apply gravitational forces from attractors
        attractors.forEach((attractor) => {
          const dx = attractor.x - node.x;
          const dy = attractor.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 300 && dist > 10) {
            const force = attractor.strength / (dist * 0.1);
            node.vx += (dx / dist) * force * 0.01;
            node.vy += (dy / dist) * force * 0.01;
          }
        });

        // Move nodes with damping
        node.vx *= 0.99;
        node.vy *= 0.99;
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges instead of bouncing
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Mouse attraction (weaker)
        const dx = mousePos.x - node.x;
        const dy = mousePos.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          const force = (120 - dist) / 120;
          node.x += dx * force * 0.02;
          node.y += dy * force * 0.02;
        }

        // Draw connections to nearby nodes (shorter distance for smaller nodes)
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.4;
            
            // Check if line passes near mouse
            const mouseDistToLine = distanceToLine(
              mousePos.x, mousePos.y,
              node.x, node.y,
              otherNode.x, otherNode.y
            );
            
            const glowMultiplier = mouseDistToLine < 50 ? 1.5 : 1;
            
            // Use blended color from both nodes
            const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
            gradient.addColorStop(0, `${node.glowColor}, ${opacity * glowMultiplier})`);
            gradient.addColorStop(1, `${otherNode.glowColor}, ${opacity * glowMultiplier})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = mouseDistToLine < 50 ? 0.5 : 0.25;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });

        // Draw node (smaller scale for smaller nodes)
        const mouseDist = Math.sqrt(
          Math.pow(mousePos.x - node.x, 2) + Math.pow(mousePos.y - node.y, 2)
        );
        
        const scale = mouseDist < 80 ? 1 + (80 - mouseDist) / 80 : 1;
        const glowSize = mouseDist < 80 ? 12 : 6;

        // Glow (more subtle for smaller nodes)
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * scale * 4
        );
        gradient.addColorStop(0, `${node.glowColor}, 0.7)`);
        gradient.addColorStop(0.5, `${node.glowColor}, 0.35)`);
        gradient.addColorStop(1, `${node.glowColor}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * scale * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = node.color;
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update global positions for text reactivity
      globalNodePositions = [...nodes];

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos.x, mousePos.y]);

  // Helper function to calculate distance from point to line
  function distanceToLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #001030 0%, #000510 100%)' }}
    />
  );
}
