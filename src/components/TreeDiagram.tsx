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

      const themeColors = {
        classic: { node: '#FF6B6B', link: '#FFE3E3', text: '#4A4A4A' },
        cyberpunk: { node: '#00F2FF', link: '#3D0066', text: '#FFFFFF' },
        nature: { node: '#4ECDC4', link: '#E0F9F7', text: '#2F4F4F' }
      };

      const colors = themeColors[theme];
      const margin = { top: 100, right: 100, bottom: 100, left: 100 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

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

        g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('d', d3.linkRadial<any, any>().angle(d => d.x).radius(d => d.y) as any)
          .attr('fill', 'none')
          .attr('stroke', colors.link)
          .attr('stroke-width', 5);

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

        node.append('circle')
          .attr('r', 30)
          .attr('fill', '#fff')
          .attr('stroke', colors.node)
          .attr('stroke-width', 6);

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '20px')
          .attr('font-weight', '900')
          .attr('fill', colors.text)
          .attr('transform', d => d.x < Math.PI ? 'rotate(0)' : 'rotate(180)')
          .text(d => d.data.value);

      } else {
        g.attr('transform', `translate(${margin.left},${margin.top})`);
        
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
          .attr('stroke-width', 6);

        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('transform', d => layoutType === 'horizontal' ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`);

        node.append('circle')
          .attr('r', 35)
          .attr('fill', '#fff')
          .attr('stroke', colors.node)
          .attr('stroke-width', 6);

        node.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .attr('font-size', '24px')
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
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black uppercase tracking-widest italic">
          ป้อนตัวเลขเพื่อปลูกต้นไม้...
        </div>
      )}
      <svg 
        ref={svgRef} 
        className="h-full w-full overflow-visible" 
        style={{ opacity: data ? 1 : 0 }} 
      />
    </div>
  );
};
