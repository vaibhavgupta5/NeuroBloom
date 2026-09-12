"use client";

import { useParentStore } from "../../stores/useParentStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useState, useEffect } from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg">
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          <span className="font-sora text-sm text-[#4A90D9] font-bold">Focus: {payload[0].value}%</span>
          <span className="font-sora text-sm text-[#3ECFB2] font-bold">Span: {payload[1].value} min</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ConcentrationChart() {
  const { concentrationData, child } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(74,144,217,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">{child.name}&apos;s Concentration</h2>
        <span className="bg-[#EBF3FC] text-[#4A90D9] px-3 py-1 rounded-full text-xs font-bold border border-white">
          This Week
        </span>
      </div>

      <div className="w-full h-[250px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concentrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} 
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12 }} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 144, 217, 0.05)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontFamily: 'var(--font-dm-sans)' }} />
              <Bar yAxisId="left" dataKey="focusScore" name="Focus Level (%)" fill="#4A90D9" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
              <Bar yAxisId="right" dataKey="attentionSpan" name="Attention Span (min)" fill="#3ECFB2" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
