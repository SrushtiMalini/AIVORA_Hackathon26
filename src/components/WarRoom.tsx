import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sword, 
  Target, 
  AlertTriangle, 
  Info,
  Network,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { WarRoomData, EvidenceNode, EvidenceLink } from '../types';
import { cn } from '../lib/utils';

interface WarRoomProps {
  data: WarRoomData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function WarRoom({ data, isLoading, onRefresh }: WarRoomProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 500;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links
    const link = svg.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 2);

    // Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (event, d: any) => setSelectedNode(d));

    // Node circles
    node.append("circle")
      .attr("r", 12)
      .attr("fill", (d: any) => {
        if (d.isContradicted) return "#ef4444";
        switch (d.type) {
          case 'person': return "#3b82f6";
          case 'document': return "#10b981";
          case 'event': return "#f59e0b";
          default: return "#6366f1";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("class", (d: any) => d.isContradicted ? "animate-pulse" : "");

    // Node labels
    node.append("text")
      .text((d: any) => d.label)
      .attr("x", 16)
      .attr("y", 4)
      .attr("class", "text-[10px] font-bold fill-brand-ink pointer-events-none")
      .style("font-family", "Inter, sans-serif");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-brand-bg p-12">
        <div className="relative w-24 h-24 mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-brand-primary/20 border-t-brand-primary rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 text-brand-primary animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-serif font-bold text-brand-ink mb-2">Analyzing Evidence...</h3>
        <p className="text-brand-muted text-sm max-w-xs text-center">
          Gemini is connecting facts, detecting contradictions, and predicting opponent moves.
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 flex flex-col bg-brand-bg overflow-hidden">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-white/50 backdrop-blur-sm border-b border-brand-border">
        <div className="p-4 bg-brand-surface rounded-3xl border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">Win Probability</p>
            <p className="text-2xl font-serif font-bold text-brand-ink">{data.winProbability}%</p>
          </div>
        </div>
        
        <div className="p-4 bg-brand-surface rounded-3xl border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
            <Network className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">Evidence Nodes</p>
            <p className="text-2xl font-serif font-bold text-brand-ink">{data.nodes.length}</p>
          </div>
        </div>

        <div className="p-4 bg-brand-surface rounded-3xl border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">Contradictions</p>
            <p className="text-2xl font-serif font-bold text-brand-ink">
              {data.nodes.filter(n => n.isContradicted).length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Visual Evidence Graph */}
        <div className="flex-1 relative bg-brand-bg">
          <div className="absolute top-6 left-6 z-10">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-brand-border shadow-sm">
              <Network className="w-4 h-4 text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink">Evidence Linker</span>
            </div>
          </div>
          
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Legend */}
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-brand-muted uppercase">Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-brand-muted uppercase">Document</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-brand-muted uppercase">Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-brand-muted uppercase">Contradiction</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={onRefresh}
            className="absolute top-6 right-6 p-3 bg-brand-surface border border-brand-border rounded-2xl shadow-sm hover:text-brand-primary transition-all active:scale-95"
            title="Re-analyze Case"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Strategy Panel */}
        <div className="w-[400px] border-l border-brand-border bg-brand-surface flex flex-col overflow-hidden">
          <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-brand-primary" />
              <h3 className="font-serif font-bold text-brand-ink">Opponent Strategy</h3>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500">
              PREDICTIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {data.opponentSwords.map((sword, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="space-y-3"
              >
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Opponent's Sword
                    </span>
                    <span className={cn(
                      "text-[8px] font-bold px-1.5 py-0.5 rounded-full border",
                      sword.riskLevel === 'HIGH' ? "bg-red-100 border-red-200 text-red-600" :
                      sword.riskLevel === 'MEDIUM' ? "bg-orange-100 border-orange-200 text-orange-600" :
                      "bg-yellow-100 border-yellow-200 text-yellow-600"
                    )}>
                      {sword.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-xs font-medium text-brand-ink italic">"{sword.attack}"</p>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                    <ShieldCheck className="w-3 h-3" /> Your Shield
                  </span>
                  <p className="text-xs text-brand-muted leading-relaxed">{sword.shield}</p>
                </div>
              </motion.div>
            ))}

            {data.opponentSwords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="w-12 h-12 text-brand-border mb-4" />
                <p className="text-sm text-brand-muted">No immediate threats detected. Keep building your case.</p>
              </div>
            )}
          </div>

          {/* Selected Node Info */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="p-6 bg-brand-primary text-white border-t border-brand-primary/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm">{selectedNode.label}</h4>
                  <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-white/10 rounded-lg">
                    <RefreshCw className="w-4 h-4 rotate-45" />
                  </button>
                </div>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold mb-2">{selectedNode.type}</p>
                {selectedNode.isContradicted && (
                  <div className="flex items-center gap-2 p-2 bg-white/10 rounded-xl border border-white/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-300" />
                    <p className="text-[10px] font-medium">This node has conflicting evidence in your consultation.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
