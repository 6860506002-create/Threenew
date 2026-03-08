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
}

export const TreeDiagram = ({ data, layoutType = 'vertical' }: TreeDiagramProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g');

    // Convert our custom tree structure to D3 hierarchy
    const root = d3.hierarchy(data, (d) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children;
    });

    if (layoutType === 'radial') {
      const radius = Math.min(innerWidth, innerHeight) / 2;
      g.attr('transform', `translate(${width / 2},${height / 2})`);
      
      const treeLayout = d3.cluster<TreeNode>().size([2 * Math.PI, radius - 40]);
      treeLayout(root);

      // Links
      g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkRadial<any, any>()
          .angle(d => d.x)
          .radius(d => d.y) as any
        )
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);

      // Nodes
      const node = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `);

      node.append('circle')
        .attr('r', 20)
        .attr('fill', '#fff')
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 3)
        .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))');

      node.append('text')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e293b')
        .attr('transform', d => d.x < Math.PI ? 'rotate(0)' : 'rotate(180)')
        .text(d => d.data.value);

    } else {
      g.attr('transform', `translate(${margin.left},${margin.top})`);
      
      const treeLayout = d3.tree<TreeNode>()
        .size(layoutType === 'horizontal' ? [innerHeight, innerWidth] : [innerWidth, innerHeight]);

      treeLayout(root);

      // Links
      g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', (layoutType === 'horizontal' 
          ? d3.linkHorizontal().x(d => (d as any).y).y(d => (d as any).x)
          : d3.linkVertical().x(d => (d as any).x).y(d => (d as any).y)) as any
        )
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);

      // Nodes
      const node = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => layoutType === 'horizontal' ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`);

      node.append('circle')
        .attr('r', 22)
        .attr('fill', '#fff')
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 3)
        .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))');

      node.append('text')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e293b')
        .text(d => d.data.value);
    }

  }, [data, layoutType]);

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
      {!data && (
        <div className="flex h-full items-center justify-center text-slate-400 italic">
          เพิ่มตัวเลขเพื่อดูโครงสร้าง Tree...
        </div>
      )}
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
};
