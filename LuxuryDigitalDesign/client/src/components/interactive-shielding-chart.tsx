import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Authentic LessEMF Silverell fabric data extracted from their actual test charts
const fullTestData = [
  { freq: 10000, db: 115 },
  { freq: 20000, db: 110 },
  { freq: 50000, db: 105 },
  { freq: 100000, db: 100 },
  { freq: 200000, db: 95 },
  { freq: 500000, db: 88 },
  { freq: 1000000, db: 82 },
  { freq: 2000000, db: 75 },
  { freq: 5000000, db: 68 },
  { freq: 10000000, db: 62 },
  { freq: 20000000, db: 55 },
  { freq: 50000000, db: 48 },
  { freq: 100000000, db: 42 },
  { freq: 200000000, db: 38 },
  { freq: 500000000, db: 35 },
  { freq: 1000000000, db: 32 },
  { freq: 2000000000, db: 28 },
  { freq: 5000000000, db: 25 },
  { freq: 10000000000, db: 22 },
  { freq: 20000000000, db: 19 },
  { freq: 40000000000, db: 17 }
];

const bandData2G = [
  { freq: 100000000, db: 52 },
  { freq: 176000000, db: 50 },
  { freq: 310000000, db: 48 },
  { freq: 547000000, db: 37 },
  { freq: 800000000, db: 47 },
  { freq: 850000000, db: 47 },
  { freq: 900000000, db: 45 },
  { freq: 965000000, db: 43 },
  { freq: 1700000000, db: 42 },
  { freq: 1800000000, db: 40 },
  { freq: 1900000000, db: 38 },
  { freq: 3000000000, db: 35 }
];

const bandData3G = [
  { freq: 100000000, db: 52 },
  { freq: 176000000, db: 49 },
  { freq: 310000000, db: 46 },
  { freq: 547000000, db: 37 },
  { freq: 850000000, db: 47 },
  { freq: 965000000, db: 46 },
  { freq: 1700000000, db: 49 },
  { freq: 1900000000, db: 42 },
  { freq: 2100000000, db: 35 },
  { freq: 3000000000, db: 35 }
];

const bandData4G = [
  { freq: 100000000, db: 52 },
  { freq: 200000000, db: 49 },
  { freq: 400000000, db: 46 },
  { freq: 700000000, db: 52 },
  { freq: 800000000, db: 49 },
  { freq: 900000000, db: 45 },
  { freq: 1500000000, db: 43 },
  { freq: 1700000000, db: 49 },
  { freq: 1800000000, db: 45 },
  { freq: 2100000000, db: 41 },
  { freq: 2600000000, db: 37 },
  { freq: 3000000000, db: 32 },
  { freq: 6000000000, db: 30 }
];

const bandData5G = [
  { freq: 100000000, db: 52 },
  { freq: 270000000, db: 47 },
  { freq: 740000000, db: 42 },
  { freq: 800000000, db: 40 },
  { freq: 900000000, db: 38 },
  { freq: 1000000000, db: 36 },
  { freq: 1500000000, db: 34 },
  { freq: 2000000000, db: 50 },
  { freq: 3500000000, db: 32 },
  { freq: 5400000000, db: 29 },
  { freq: 15000000000, db: 26 },
  { freq: 24000000000, db: 19 },
  { freq: 28000000000, db: 17 },
  { freq: 40000000000, db: 16 }
];

// Frequency band configurations with authentic LessEMF data and exact axis ranges
const frequencyBands = {
  "Full Test": {
    minFreq: 10000,
    maxFreq: 40000000000,
    minDb: 0,
    maxDb: 120,
    data: fullTestData,
    bands: [
      { min: 800000000, max: 1900000000, color: "rgba(255, 182, 193, 0.6)" },
      { min: 1900000000, max: 2100000000, color: "rgba(173, 216, 230, 0.6)" },
      { min: 700000000, max: 2600000000, color: "rgba(255, 255, 224, 0.6)" },
      { min: 24000000000, max: 28000000000, color: "rgba(221, 160, 221, 0.6)" },
      { min: 37000000000, max: 40000000000, color: "rgba(255, 200, 150, 0.6)" },
    ]
  },
  "2G": {
    minFreq: 100000000,
    maxFreq: 3000000000,
    minDb: 30,
    maxDb: 60,
    data: bandData2G,
    bands: [
      { min: 850000000, max: 965000000, color: "rgba(255, 182, 193, 0.8)" },
      { min: 1700000000, max: 1900000000, color: "rgba(173, 216, 230, 0.8)" },
    ]
  },
  "3G": {
    minFreq: 100000000,
    maxFreq: 3000000000,
    minDb: 30,
    maxDb: 60,
    data: bandData3G,
    bands: [
      { min: 850000000, max: 965000000, color: "rgba(173, 216, 230, 0.8)" },
      { min: 1700000000, max: 2100000000, color: "rgba(173, 216, 230, 0.8)" },
    ]
  },
  "4G": {
    minFreq: 100000000,
    maxFreq: 6000000000,
    minDb: 30,
    maxDb: 60,
    data: bandData4G,
    bands: [
      { min: 700000000, max: 900000000, color: "rgba(173, 216, 230, 0.8)" },
      { min: 1500000000, max: 1800000000, color: "rgba(200, 255, 200, 0.8)" },
      { min: 2100000000, max: 2600000000, color: "rgba(255, 255, 224, 0.8)" },
      { min: 3000000000, max: 6000000000, color: "rgba(255, 200, 255, 0.8)" },
    ]
  },
  "5G": {
    minFreq: 100000000,
    maxFreq: 40000000000,
    minDb: 15,
    maxDb: 60,
    data: bandData5G,
    bands: [
      { min: 2000000000, max: 3500000000, color: "rgba(173, 216, 230, 0.8)" },
      { min: 24000000000, max: 28000000000, color: "rgba(221, 160, 221, 0.8)" },
      { min: 37000000000, max: 40000000000, color: "rgba(255, 200, 150, 0.8)" },
    ]
  },
};

interface InteractiveShieldingChartProps {
  className?: string;
}

export default function InteractiveShieldingChart({ className = "" }: InteractiveShieldingChartProps) {
  const [selectedBand, setSelectedBand] = useState<string>("Full Test");
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Listen for window resize to update chart dimensions
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentConfig = frequencyBands[selectedBand as keyof typeof frequencyBands];
  const chartData = currentConfig.data;

  // Responsive chart dimensions based on current window width
  const getResponsiveDimensions = () => {
    const isTablet = windowWidth < 1024;
    const isMobile = windowWidth < 768;
    
    if (isMobile) {
      return {
        width: Math.min(windowWidth - 32, 360),
        height: 280,
        padding: { top: 30, right: 15, bottom: 60, left: 50 }
      };
    } else if (isTablet) {
      return {
        width: Math.min(windowWidth - 64, 700),
        height: 320,
        padding: { top: 35, right: 30, bottom: 70, left: 65 }
      };
    } else {
      return {
        width: 900,
        height: 350,
        padding: { top: 40, right: 40, bottom: 80, left: 80 }
      };
    }
  };

  const { width: chartWidth, height: chartHeight, padding } = getResponsiveDimensions();
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales - logarithmic for frequency, linear for dB
  const minFreq = Math.log10(currentConfig.minFreq);
  const maxFreq = Math.log10(currentConfig.maxFreq);
  const minDb = currentConfig.minDb;
  const maxDb = currentConfig.maxDb;

  const xScale = (freq: number) => {
    const logFreq = Math.log10(freq);
    return padding.left + ((logFreq - minFreq) / (maxFreq - minFreq)) * plotWidth;
  };

  const yScale = (db: number) => {
    return padding.top + ((maxDb - db) / (maxDb - minDb)) * plotHeight;
  };

  // Generate path for the line chart
  const pathData = chartData
    .map((point, index) => {
      const x = xScale(point.freq);
      const y = yScale(point.db);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate area fill path
  const areaData = `${pathData} L ${xScale(chartData[chartData.length - 1].freq)} ${yScale(minDb)} L ${xScale(chartData[0].freq)} ${yScale(minDb)} Z`;

  // Generate frequency axis labels based on current range
  const getFreqLabel = (freq: number) => {
    if (freq >= 1000000000) return `${(freq / 1000000000).toFixed(1)} GHz`;
    if (freq >= 1000000) return `${(freq / 1000000).toFixed(1)} MHz`;
    if (freq >= 1000) return `${(freq / 1000).toFixed(0)} kHz`;
    return `${freq} Hz`;
  };

  // Generate axis tick marks based on frequency range
  const generateAxisTicks = () => {
    const range = maxFreq - minFreq;
    const tickCount = 6;
    const ticks = [];
    
    for (let i = 0; i <= tickCount; i++) {
      const logFreq = minFreq + (range * i / tickCount);
      const freq = Math.pow(10, logFreq);
      ticks.push(freq);
    }
    return ticks;
  };

  // Generate dB axis ticks
  const generateDbTicks = () => {
    const range = maxDb - minDb;
    const step = range <= 30 ? 10 : 20;
    const ticks = [];
    
    for (let db = minDb; db <= maxDb; db += step) {
      ticks.push(db);
    }
    return ticks;
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="bg-white border border-gray-300">
        <CardContent className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Shielding Specs Chart</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Silverell® Fabric</span>
              </div>
              <span className="sm:ml-4">{Math.max(...chartData.map((d: any) => d.db))} dB Maximum Shielding</span>
            </div>
          </div>

          {/* Responsive Button Controls */}
          <div className="mb-4 md:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
              {Object.keys(frequencyBands).map((band) => (
                <Button
                  key={band}
                  variant={selectedBand === band ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBand(band)}
                  className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-auto whitespace-nowrap"
                >
                  {band}
                </Button>
              ))}
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="bg-gray-50 rounded-lg p-2 md:p-4 border overflow-x-auto">
            <svg 
              width={chartWidth} 
              height={chartHeight} 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-0"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width={plotWidth} height={plotHeight} x={padding.left} y={padding.top} fill="url(#grid)" />

              {/* Frequency bands visualization */}
              {currentConfig.bands?.map((band, index) => (
                <rect
                  key={index}
                  x={xScale(band.min)}
                  y={padding.top}
                  width={xScale(band.max) - xScale(band.min)}
                  height={plotHeight}
                  fill={band.color}
                />
              ))}

              {/* Main area fill */}
              <path 
                d={areaData} 
                fill="rgba(34, 197, 94, 0.2)" 
                stroke="none"
              />

              {/* Main line */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((point: any, index: number) => (
                <circle
                  key={index}
                  cx={xScale(point.freq)}
                  cy={yScale(point.db)}
                  r="3"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="1"
                />
              ))}

              {/* Y-axis */}
              <line 
                x1={padding.left} 
                y1={padding.top} 
                x2={padding.left} 
                y2={chartHeight - padding.bottom} 
                stroke="#374151" 
                strokeWidth="1"
              />

              {/* X-axis */}
              <line 
                x1={padding.left} 
                y1={chartHeight - padding.bottom} 
                x2={chartWidth - padding.right} 
                y2={chartHeight - padding.bottom} 
                stroke="#374151" 
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              {generateDbTicks().map(db => (
                <g key={db}>
                  <text
                    x={padding.left - 10}
                    y={yScale(db)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#374151"
                    fontSize={chartWidth < 500 ? "10" : "12"}
                  >
                    {db}
                  </text>
                  <line
                    x1={padding.left - 5}
                    y1={yScale(db)}
                    x2={padding.left}
                    y2={yScale(db)}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* X-axis labels */}
              {generateAxisTicks().map((freq: number) => (
                <g key={freq}>
                  <text
                    x={xScale(freq)}
                    y={chartHeight - padding.bottom + (chartWidth < 500 ? 15 : 20)}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize={chartWidth < 500 ? "9" : "12"}
                  >
                    {getFreqLabel(freq)}
                  </text>
                  <line
                    x1={xScale(freq)}
                    y1={chartHeight - padding.bottom}
                    x2={xScale(freq)}
                    y2={chartHeight - padding.bottom + 5}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Axis titles - responsive sizing */}
              <text
                x={padding.left - (chartWidth < 500 ? 35 : 50)}
                y={chartHeight / 2}
                textAnchor="middle"
                fill="#374151"
                fontSize={chartWidth < 500 ? "10" : "14"}
                transform={`rotate(-90, ${padding.left - (chartWidth < 500 ? 35 : 50)}, ${chartHeight / 2})`}
              >
                {chartWidth < 500 ? "dB" : "Shielding in Decibels (dB)"}
              </text>
              <text
                x={chartWidth / 2}
                y={chartHeight - (chartWidth < 500 ? 10 : 20)}
                textAnchor="middle"
                fill="#374151"
                fontSize={chartWidth < 500 ? "10" : "14"}
              >
                {chartWidth < 500 ? "Frequency (Hz)" : "Frequency in Hz"}
              </text>
            </svg>
          </div>

          {/* Technical Summary - responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm bg-gray-50 rounded-lg p-3 md:p-4 mt-4 mb-4">
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-1">Current Range</div>
              <div className="text-gray-600 text-xs md:text-sm">
                {getFreqLabel(currentConfig.minFreq)} - {getFreqLabel(currentConfig.maxFreq)}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-1">Peak Shielding</div>
              <div className="text-green-600 font-bold text-sm md:text-base">
                {Math.max(...chartData.map((d: any) => d.db))} dB
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-1">Fabric Origin</div>
              <div className="text-gray-600 text-xs md:text-sm">German Silverell®</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}