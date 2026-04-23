import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  color?: string;
  title: string;
  unit?: string;
  darkMode?: boolean;
  heightClass?: string;
}

const Chart: React.FC<ChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  color = "#4f46e5", 
  title, 
  unit = "", 
  darkMode = false,
  heightClass = "h-64 md:h-80"
}) => {
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
  const tooltipText = darkMode ? '#f8fafc' : '#0f172a';

  return (
    <div className={`w-full ${heightClass} bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors`}>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey={nameKey} 
            tick={{fontSize: 12, fill: textColor}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{fontSize: 12, fill: textColor}} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip 
            cursor={{fill: darkMode ? '#334155' : '#f1f5f9'}}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: tooltipBg,
              color: tooltipText
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={index % 2 === 0 ? color : `${color}cc`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;