"use client";

import { useParentStore } from "../../stores/useParentStore";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useState, useEffect } from "react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg">
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm mb-2">{data.day}</p>
        <div className="flex flex-col gap-1">
          <span className="font-sora text-sm text-[#FF7E6B] font-bold">Incidents: {data.incidents}</span>
          <span className="font-sora text-sm text-[#FFA94D] font-bold">Intensity: {data.intensity}/5</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function BehavioralLogChart() {
  const { behavioralData, child } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(255,126,107,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Behavioral Triggers</h2>
          <p className="font-dm-sans text-xs text-[#8FA3B1]">Incidents & Intensity log</p>
        </div>
        <span className="bg-[#FFF0ED] text-[#FF7E6B] px-3 py-1 rounded-full text-xs font-bold border border-white">
          This Week
        </span>
      </div>

      <div className="w-full h-[250px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                type="category"
                allowDuplicatedCategory={false}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} 
                dy={10}
              />
              <YAxis 
                dataKey="intensity"
                domain={[0, 5]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12 }} 
                label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fill: '#8FA3B1', fontSize: 12 }}
              />
              <ZAxis dataKey="incidents" range={[50, 400]} name="Incidents" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter data={behavioralData} fill="#FF7E6B" animationDuration={1500}>
                {behavioralData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.incidents > 0 ? '#FF7E6B' : 'transparent'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
