"use client";

import { useParentStore } from "../../stores/useParentStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from "react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm">{data.name}:</p>
        <span className="font-sora text-sm font-bold" style={{ color: data.color }}>{data.value}%</span>
      </div>
    );
  }
  return null;
};

export default function CompletionRateChart() {
  const { completionData } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(30,58,138,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Task Completion</h2>
          <p className="font-dm-sans text-xs text-[#8FA3B1]">Modules started vs finished</p>
        </div>
      </div>

      <div className="w-full h-[250px] mt-2 relative">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontFamily: 'var(--font-dm-sans)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {mounted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="block font-sora font-bold text-3xl text-[#1B2D3E]">{completionData[0].value}%</span>
              <span className="block font-dm-sans text-xs text-[#8FA3B1]">Success</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
