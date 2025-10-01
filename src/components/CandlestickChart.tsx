import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
}

export const CandlestickChart = ({ data, height = 400 }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#9ca3af",
      },
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
    });

    seriesRef.current = chartRef.current.addSeries({
      type: "Candlestick",
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    } as any);

    seriesRef.current.setData(data);

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
      chartRef.current?.remove();
    };
  }, [height]);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />;
};
