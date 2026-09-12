"use client";

import { useParentStore } from "../../stores/useParentStore";
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useState, useEffect } from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg">
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          <span className="font-sora text-sm text-[#C4B5FD] font-bold">Sleep: {payload[0].value} hrs</span>
          <span className="font-sora text-sm text-[#3ECFB2] font-bold">Mood Score: {payload[1].value}/5</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SleepMoodChart() {
  const { sleepMoodData } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(196,181,253,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Sleep vs. Mood</h2>
          <p className="font-dm-sans text-xs text-[#8FA3B1]">Correlation tracker</p>
        </div>
        <span className="bg-[#F3F0FF] text-[#C4B5FD] px-3 py-1 rounded-full text-xs font-bold border border-white">
          This Week
        </span>
      </div>

      <div className="w-full h-[250px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sleepMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                domain={[0, 12]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12 }} 
                domain={[0, 5]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196, 181, 253, 0.05)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontFamily: 'var(--font-dm-sans)' }} />
              <Bar yAxisId="left" dataKey="sleepHours" name="Sleep (Hours)" fill="#C4B5FD" radius={[4, 4, 0, 0]} barSize={16} animationDuration={1500} />
              <Line yAxisId="right" type="monotone" dataKey="moodScore" name="Mood (Score)" stroke="#3ECFB2" strokeWidth={3} dot={{ r: 4, fill: '#3ECFB2', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} animationDuration={1500} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
