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
    if (!svgRef.current || !containerRef.current || !data) return;

    const updateDiagram = () => {
      if (!svgRef.current || !containerRef.current) return;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 500;
      
      const themeColors = {
        classic: { node: '#FF6B6B', link: '#FFE3E3', text: '#4A4A4A', bg: '#FFF5F5' },
        cyberpunk: { node: '#00F2FF', link: '#3D0066', text: '#FFFFFF', bg: '#0F172A' },
        nature: { node: '#4ECDC4', link: '#E0F9F7', text: '#2F4F4F', bg: '#F0FFF4' }
      };

      const colors = themeColors[theme];
      svg.style('background', 'transparent');

      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const root = d3.hierarchy(data, (d) => {
        const children = [];
        if (d.left) children.push(d.left);
        if (d.right) children.push(d.right);
        return children;
      });

      if (layoutType === 'radial') {
        const radius = Math.min(innerWidth, innerHeight) / 2;
        g.attr('transform', `translate(${width / 2},${height / 2})`);
        
        const treeLayout = d3.tree<TreeNode>().size([2 * Math.PI, radius]);
        treeLayout(root);

        g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('d', d3.linkRadial<any, any>().angle(d => d.x).radius(d => d.y) as any)
          .attr('fill', 'none')
          .attr('stroke', colors.link)
          .attr('stroke-width', 4);

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

        node.append('circle')
          .attr('r', 22)
          .attr('fill', '#fff')
          .attr('stroke', colors.node)
          .attr('stroke-width', 4);

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-weight', '900')
          .attr('fill', colors.text)
          .attr('transform', d => d.x < Math.PI ? 'rotate(0)' : 'rotate(180)')
          .text(d => d.data.value);

      } else {
        const treeLayout = d3.tree<TreeNode>()
          .size(layoutType === 'horizontal' ? [innerHeight, innerWidth] : [innerWidth, innerHeight]);

        treeLayout(root);

        g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('d', (layoutType === 'horizontal' 
            ? d3.linkHorizontal().x(d => (d as any).y).y(d => (d as any).x)
            : d3.linkVertical().x(d => (d as any).x).y(d => (d as any).y)) as any
          )
          .attr('fill', 'none')
          .attr('stroke', colors.link)
          .attr('stroke-width', 4);

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('transform', d => layoutType === 'horizontal' ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`);

        node.append('circle')
          .attr('r', 24)
          .attr('fill', '#fff')
          .attr('stroke', colors.node)
          .attr('stroke-width', 4);

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-weight', '900')
          .attr('fill', colors.text)
          .text(d => d.data.value);
      }
    };

    updateDiagram();
    window.addEventListener('resize', updateDiagram);
    return () => window.removeEventListener('resize', updateDiagram);
  }, [data, layoutType, theme]);

  return (
    <div ref={containerRef} className="h-full w-full min-h-[500px] flex items-center justify-center bg-transparent">
      {!data ? (
        <div className="text-slate-300 font-black uppercase tracking-widest italic">
          ป้อนตัวเลขเพื่อปลูกต้นไม้...
        </div>
      ) : (
        <svg ref={svgRef} className="h-full w-full overflow-visible" />
      )}
    </div>
  );
};
