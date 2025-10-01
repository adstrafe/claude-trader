import { useEffect, useRef } from "react";
import { createChart, CandlestickData, CandlestickSeries } from "lightweight-charts";

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
  isDarkMode?: boolean;
}

export const CandlestickChart = ({ data, height = 400, isDarkMode = true }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  // Update chart theme when dark mode changes
  useEffect(() => {
    if (!chartRef.current) return;

    const theme = isDarkMode ? {
      background: { color: "transparent" },
      textColor: "#9ca3af",
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      timeScale: {
        borderColor: "#374151",
      },
      rightPriceScale: {
        borderColor: "#374151",
      },
    } : {
      background: { color: "transparent" },
      textColor: "#374151",
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      timeScale: {
        borderColor: "#d1d5db",
      },
      rightPriceScale: {
        borderColor: "#d1d5db",
      },
    };

    chartRef.current.applyOptions({
      layout: theme,
      grid: theme.grid,
      timeScale: theme.timeScale,
      rightPriceScale: theme.rightPriceScale,
    });
  }, [isDarkMode]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const theme = isDarkMode ? {
      background: { color: "transparent" },
      textColor: "#9ca3af",
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      timeScale: {
        borderColor: "#374151",
      },
      rightPriceScale: {
        borderColor: "#374151",
      },
    } : {
      background: { color: "transparent" },
      textColor: "#374151",
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      timeScale: {
        borderColor: "#d1d5db",
      },
      rightPriceScale: {
        borderColor: "#d1d5db",
      },
    };

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: theme,
      grid: theme.grid,
      timeScale: theme.timeScale,
      rightPriceScale: theme.rightPriceScale,
    });

    // v5.0 API: Pass CandlestickSeries as first argument
    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    if (data.length > 0) {
      seriesRef.current.setData(data);
    }

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />;
};
