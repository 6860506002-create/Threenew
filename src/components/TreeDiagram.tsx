import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface TreeDiagramProps {
  data: TreeNode | null;
  layoutType?: 'vertical' | 'horizontal' | 'radial';
  theme?: 'classic' | 'cyberpunk' | 'nature';
}

export const TreeDiagram = ({ data, layoutType = 'vertical', theme = 'classic' }: TreeDiagramProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const updateDiagram = () => {
      if (!svgRef.current || !containerRef.current) return;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = 1000;
      const height = 800;
      svg.attr('viewBox', `0 0 ${width} ${height}`);

      if (!data) return;

      const themeColors: Record<string, { 
        node: string; 
        link: string; 
        text: string; 
        bg: string; 
        nodeBg: string; 
        strokeWidth: number;
        glow?: string;
      }> = {
        classic: { 
          node: '#F472B6', // cute-pink
          link: '#FCE7F3', 
          text: '#1E293B',
          bg: '#FFFFFF',
          nodeBg: '#FFFFFF',
          strokeWidth: 6
        },
        cyberpunk: { 
          node: '#00F2FF', 
          link: '#334155', 
          text: '#00F2FF',
          bg: '#0F172A',
          nodeBg: '#1E293B',
          glow: '0 0 15px #00F2FF',
          strokeWidth: 2
        },
        nature: { 
          node: '#10B981', 
          link: '#D1FAE5', 
          text: '#064E3B',
          bg: '#F0FDF4',
          nodeBg: '#FFFFFF',
          strokeWidth: 8
        }
      };

      const colors = themeColors[theme];
      const margin = { top: 80, right: 80, bottom: 80, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Add background color based on theme
      svg.style('background-color', colors.bg);

      const g = svg.append('g');

      const root = d3.hierarchy(data, (d: any) => {
        const children = [];
        if (d && d.left) children.push(d.left);
        if (d && d.right) children.push(d.right);
        return children;
      });

      if (layoutType === 'radial') {
        const radius = Math.min(innerWidth, innerHeight) / 2;
        g.attr('transform', `translate(${width / 2},${height / 2})`);
        
        const treeLayout = d3.tree<TreeNode>().size([2 * Math.PI, radius]);
        treeLayout(root);

        const links = g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', colors.link)
          .attr('stroke-width', colors.strokeWidth)
          .attr('d', d3.linkRadial<any, any>().angle(d => d.x).radius(() => 0) as any);

        links.transition()
          .duration(800)
          .attr('d', d3.linkRadial<any, any>().angle(d => d.x).radius(d => d.y) as any);

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(0,0)`);

        node.transition()
          .duration(800)
          .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

        node.append('circle')
          .attr('r', 30)
          .attr('fill', colors.nodeBg)
          .attr('stroke', colors.node)
          .attr('stroke-width', colors.strokeWidth)
          .style('filter', theme === 'cyberpunk' ? `drop-shadow(${colors.glow})` : 'none');

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '18px')
          .attr('font-weight', '900')
          .attr('fill', colors.text)
          .attr('transform', d => d.x < Math.PI ? 'rotate(90)' : 'rotate(-90)')
          .text(d => d.data.value);

      } else {
        g.attr('transform', `translate(${margin.left},${margin.top})`);
        
        const treeLayout = d3.tree<TreeNode>()
          .size(layoutType === 'horizontal' ? [innerHeight, innerWidth] : [innerWidth, innerHeight]);

        treeLayout(root);

        const links = g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('fill', 'none')
          .attr('stroke', colors.link)
          .attr('stroke-width', colors.strokeWidth)
          .attr('d', (d: any) => {
            const start = layoutType === 'horizontal' ? `M${d.source.y},${d.source.x}` : `M${d.source.x},${d.source.y}`;
            return `${start} L${layoutType === 'horizontal' ? d.source.y : d.source.x},${layoutType === 'horizontal' ? d.source.x : d.source.y}`;
          });

        links.transition()
          .duration(800)
          .attr('d', (layoutType === 'horizontal' 
            ? d3.linkHorizontal().x(d => (d as any).y).y(d => (d as any).x)
            : d3.linkVertical().x(d => (d as any).x).y(d => (d as any).y)) as any
          );

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', d => {
            const x = layoutType === 'horizontal' ? root.y : root.x;
            const y = layoutType === 'horizontal' ? root.x : root.y;
            return `translate(${x},${y})`;
          });

        node.transition()
          .duration(800)
          .attr('transform', d => layoutType === 'horizontal' ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`);

        node.append('circle')
          .attr('r', 35)
          .attr('fill', colors.nodeBg)
          .attr('stroke', colors.node)
          .attr('stroke-width', colors.strokeWidth)
          .style('filter', theme === 'cyberpunk' ? `drop-shadow(${colors.glow})` : 'none');

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '22px')
          .attr('font-weight', '900')
          .attr('fill', colors.text)
          .text(d => d.data.value);
      }
    };

    updateDiagram();
    const resizeObserver = new ResizeObserver(() => updateDiagram());
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [data, layoutType, theme]);

  return (
    <div ref={containerRef} className="h-full w-full min-h-[500px] relative flex items-center justify-center bg-white overflow-visible">
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest italic text-sm text-center px-10">
          ยังไม่มีข้อมูลน้องต้นไม้เลยจ้า <br />ลองใส่ตัวเลขในแผงควบคุมด้านซ้ายดูนะ! 🌸
        </div>
      )}
      <svg 
        ref={svgRef} 
        className="h-full w-full overflow-visible transition-opacity duration-500" 
        style={{ opacity: data ? 1 : 0 }} 
      />
    </div>
  );
};
