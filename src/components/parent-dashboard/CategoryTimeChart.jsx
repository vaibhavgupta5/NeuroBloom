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
        <span className="font-sora text-sm font-bold" style={{ color: data.color }}>{data.value} min</span>
      </div>
    );
  }
  return null;
};

export default function CategoryTimeChart() {
  const { categoryTimeData, child } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(255,176,32,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Time Spent by Category</h2>
        <span className="bg-[#FFF8E6] text-[#FFB020] px-3 py-1 rounded-full text-xs font-bold border border-white">
          This Week
        </span>
      </div>

      <div className="w-full h-[250px] mt-2">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryTimeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
              >
                {categoryTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontFamily: 'var(--font-dm-sans)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
