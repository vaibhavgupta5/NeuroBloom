"use client";

import { useParentStore } from "../../stores/useParentStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState, useEffect } from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg">
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          <span className="font-sora text-sm text-[#C4B5FD] font-bold">New Words: {data.wordsLearned}</span>
          <span className="font-sora text-sm text-[#1B2D3E] font-bold">Total Known: {data.cumulative}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function VocabularyGrowthChart() {
  const { vocabularyData, child } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(196,181,253,0.2),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Vocabulary Growth</h2>
          <p className="font-dm-sans text-xs text-[#8FA3B1]">Cumulative words & symbols learned</p>
        </div>
        <span className="bg-[#F3F0FF] text-[#A78BFA] px-3 py-1 rounded-full text-xs font-bold border border-white">
          Monthly
        </span>
      </div>

      <div className="w-full h-[250px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vocabularyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="week" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12 }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#C4B5FD" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVocab)" 
                isAnimationActive={true}
                animationDuration={1500}
                activeDot={{ r: 6, fill: "#C4B5FD", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
