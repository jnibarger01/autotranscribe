import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { InvoiceTotals } from '../types';

interface CostChartProps {
  totals: InvoiceTotals;
}

const CostChart: React.FC<CostChartProps> = ({ totals }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const data = [
      { label: 'Parts', value: totals.parts_amount, color: '#3b82f6' }, // blue-500
      { label: 'Labor', value: totals.labor_amount, color: '#f59e0b' }, // amber-500
      { label: 'Misc', value: totals.misc_charges, color: '#64748b' },  // slate-500
      { label: 'Tax', value: totals.tax, color: '#ef4444' },    // red-500
    ];

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(60)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return arc(d) || '';
        };
      });

    // Center Text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .text('Total')
      .attr('class', 'text-xs fill-slate-500 uppercase font-semibold');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .text(`$${totals.grand_total.toFixed(2)}`)
      .attr('class', 'text-lg fill-slate-900 font-bold');

  }, [totals]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-slate-500 mb-4">Cost Distribution</h3>
      <svg ref={svgRef}></svg>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Parts</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Labor</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Misc</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Tax</div>
      </div>
    </div>
  );
};

export default CostChart;