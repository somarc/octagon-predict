import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { time: "00:00", priceA: 0.45, priceB: 0.55 },
  { time: "04:00", priceA: 0.48, priceB: 0.52 },
  { time: "08:00", priceA: 0.47, priceB: 0.53 },
  { time: "12:00", priceA: 0.52, priceB: 0.48 },
  { time: "16:00", priceA: 0.55, priceB: 0.45 },
  { time: "20:00", priceA: 0.58, priceB: 0.42 },
  { time: "24:00", priceA: 0.57, priceB: 0.43 },
];

export function PriceChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(2)}`}
            domain={[0, 1]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1d2d', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="priceA" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorA)" 
            name="Red Corner"
          />
          <Area 
            type="monotone" 
            dataKey="priceB" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorB)" 
            name="Blue Corner"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
