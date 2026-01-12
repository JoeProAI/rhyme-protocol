'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY + window.scrollY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // More visible neural network
    const nodeCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
    
    const initNodes = () => {
      nodesRef.current = [];
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 2.5 + 1.5,
          opacity: Math.random() * 0.5 + 0.35,
        });
      }
    };
    initNodes();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Mouse attraction
        const mouseDx = mouseRef.current.x - node.x;
        const mouseDy = mouseRef.current.y - node.y;
        const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDist < 200 && mouseDist > 0) {
          const mouseForce = (200 - mouseDist) / 200;
          node.vx += (mouseDx / mouseDist) * mouseForce * 0.08;
          node.vy += (mouseDy / mouseDist) * mouseForce * 0.08;
        }

        node.x += node.vx;
        node.y += node.vy;

        // Damping
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Wrap around
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Draw node with glow near mouse
        const glowBoost = mouseDist < 150 ? (150 - mouseDist) / 150 * 0.4 : 0;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 162, 39, ${Math.min(node.opacity + glowBoost, 0.9)})`;
        ctx.fill();
      });

      // Draw connections - visible gold lines with mouse boost
      ctx.lineWidth = 1;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const n1 = nodesRef.current[i];
          const n2 = nodesRef.current[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            // Check if connection is near mouse
            const midX = (n1.x + n2.x) / 2;
            const midY = (n1.y + n2.y) / 2;
            const mouseDistToLine = Math.sqrt(
              Math.pow(mouseRef.current.x - midX, 2) + 
              Math.pow(mouseRef.current.y - midY, 2)
            );
            const mouseBoost = mouseDistToLine < 150 ? (150 - mouseDistToLine) / 150 * 0.25 : 0;
            
            const opacity = ((200 - dist) / 200) * 0.28 + mouseBoost;
            ctx.strokeStyle = `rgba(201, 162, 39, ${Math.min(opacity, 0.5)})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      resize();
      initNodes();
    };
    window.addEventListener('resize', handleResize);

    // Handle scroll height changes
    const resizeObserver = new ResizeObserver(() => {
      const newHeight = document.documentElement.scrollHeight;
      if (canvas.height !== newHeight) {
        canvas.height = newHeight;
      }
    });
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
