"use client";

import { useParentStore } from "../../stores/useParentStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";
import { Smile, Frown, Meh } from "lucide-react";

const getIconForMood = (iconKey, props) => {
  switch (iconKey) {
    case 'happy': return <Smile {...props} className="text-[#3ECFB2]" />;
    case 'neutral': return <Meh {...props} className="text-[#4A90D9]" />;
    case 'sad': return <Frown {...props} className="text-[#FF7E6B]" />;
    default: return <Smile {...props} className="text-[#3ECFB2]" />;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-lg">
        <p className="font-dm-sans font-bold text-[#1B2D3E] text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {getIconForMood(data.iconKey, { size: 20 })}
          <span className="font-sora font-bold text-[#3ECFB2]">{data.score}/5</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;

  return (
    <foreignObject x={cx - 12} y={cy - 12} width={24} height={24}>
      {getIconForMood(payload.iconKey, { size: 24, strokeWidth: 2.5 })}
    </foreignObject>
  );
};

export default function MoodChart() {
  const { weeklyMoodData, child } = useParentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">{child.name}&apos;s Mood This Week</h2>
        <span className="bg-[#E8FAF6] text-[#1A9E8C] px-3 py-1 rounded-full text-xs font-bold border border-white">
          This Week
        </span>
      </div>

      <div className="w-full h-[250px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECFB2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3ECFB2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8FA3B1', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} 
                dy={10}
              />
              <YAxis 
                domain={[1, 5]} 
                axisLine={false} 
                tickLine={false} 
                tick={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3ECFB2" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                isAnimationActive={true}
                animationDuration={1500}
                dot={<CustomizedDot />}
                activeDot={{ r: 6, fill: "#3ECFB2", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
