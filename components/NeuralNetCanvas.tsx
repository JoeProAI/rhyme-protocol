'use client';

import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

export default function NeuralNetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    // Check for dark mode
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    const handleDarkChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    darkQuery.addEventListener('change', handleDarkChange);
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      darkQuery.removeEventListener('change', handleDarkChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const nodeCount = prefersReducedMotion ? 30 : 50;
    const initialNodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      initialNodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.2 : 0.5),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.2 : 0.5),
        connections: []
      });
    }
    setNodes(initialNodes);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = isDark ? 'rgba(5, 5, 8, 0.15)' : 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Very light mouse interaction - subtle attraction
        const dx = mousePos.current.x - node.x;
        const dy = mousePos.current.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200 && !prefersReducedMotion) {
          node.vx += dx * 0.00003;
          node.vy += dy * 0.00003;
        }

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Draw connections - Matte Chalk with very light opacity
        nodes.forEach((otherNode, j) => {
          if (i >= j) return;

          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const opacity = (1 - distance / 180) * 0.5; // Very visible
            // Electric blue gradient lines for acceleration
            const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
            if (isDark) {
              gradient.addColorStop(0, `rgba(0, 102, 255, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(0, 212, 255, ${opacity * 1.3})`);
              gradient.addColorStop(1, `rgba(0, 102, 255, ${opacity})`);
            } else {
              gradient.addColorStop(0, `rgba(0, 102, 255, ${opacity * 0.6})`);
              gradient.addColorStop(0.5, `rgba(0, 212, 255, ${opacity * 0.8})`);
              gradient.addColorStop(1, `rgba(0, 102, 255, ${opacity * 0.6})`);
            }

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5; // Thick, visible lines
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });

        // Draw node - Bold and visible
        const mouseDist = Math.sqrt(
          Math.pow(mousePos.current.x - node.x, 2) +
          Math.pow(mousePos.current.y - node.y, 2)
        );
        const nodeSize = mouseDist < 150 ? 4 + (150 - mouseDist) / 30 : 4;

        // Bold blue node gradient
        const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize * 4);
        if (isDark) {
          nodeGradient.addColorStop(0, 'rgba(0, 212, 255, 1)');
          nodeGradient.addColorStop(0.3, 'rgba(0, 102, 255, 0.8)');
          nodeGradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
        } else {
          nodeGradient.addColorStop(0, 'rgba(0, 102, 255, 0.9)');
          nodeGradient.addColorStop(0.3, 'rgba(0, 212, 255, 0.6)');
          nodeGradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
        }

        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Electric glow on hover
        if (mouseDist < 120) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = isDark ? 'rgba(0, 212, 255, 0.8)' : 'rgba(0, 102, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, prefersReducedMotion, isDark]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cyber-darker via-cyber-dark to-cyber-gray">
        <div className="absolute inset-0 cyber-grid opacity-20" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh', background: isDark ? '#050508' : '#ffffff' }}
    />
  );
}