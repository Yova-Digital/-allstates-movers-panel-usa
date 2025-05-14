// Simple chart components compatible with React 19
// This is a temporary solution until Recharts is compatible with React 19

import React from 'react';

// Simple responsive container for charts
export const ResponsiveContainer = ({ 
  width = '100%', 
  height = 400, 
  children 
}: { 
  width?: string | number, 
  height?: string | number, 
  children: React.ReactNode 
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative' as 'relative'
  };
  
  return (
    <div style={style}>
      {children}
    </div>
  );
};

// Simple bar chart component
export const BarChart = ({ 
  data = [], 
  margin = { top: 5, right: 20, bottom: 5, left: 20 },
  children 
}: {
  data: any[],
  margin?: { top: number, right: number, bottom: number, left: number },
  children?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-end justify-center w-full h-[80%] space-x-2 pb-4">
        {data.map((item, index) => {
          const value = item.value || item.total || 0;
          const maxValue = Math.max(...data.map(d => d.value || d.total || 0));
          const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-12 bg-blue-500 rounded-t-sm" 
                style={{ height: `${heightPercentage}%`, minHeight: value > 0 ? '8px' : '0' }}
              />
              <div className="mt-2 text-xs text-center">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple area chart component
export const AreaChart = ({ 
  data = [], 
  margin = { top: 5, right: 20, bottom: 5, left: 20 },
  children 
}: {
  data: any[],
  margin?: { top: number, right: number, bottom: number, left: number },
  children?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-end justify-center w-full h-[80%] space-x-0">
        {data.map((item, index) => {
          const value = item.total || 0;
          const maxValue = Math.max(...data.map(d => d.total || 0));
          const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 opacity-80 rounded-t-sm" 
                style={{ height: `${heightPercentage}%`, minHeight: value > 0 ? '8px' : '0' }}
              />
              {index % Math.max(1, Math.floor(data.length / 6)) === 0 && (
                <div className="mt-2 text-xs text-center">{item.name}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Placeholder components that don't affect rendering
export const Area = () => null;
export const Bar = () => null;
export const CartesianGrid = ({ strokeDasharray }: { strokeDasharray?: string }) => null;
export const Legend = () => null;
export const Tooltip = () => null;
export const XAxis = ({ dataKey }: { dataKey?: string }) => null;
export const YAxis = ({ dataKey }: { dataKey?: string }) => null;
