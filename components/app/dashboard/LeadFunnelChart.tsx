"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Define the lead funnel stages with appropriate display names
const FUNNEL_STAGES = [
  { id: "lead_entrante", name: "Lead Entrante", color: "#4F46E5" },
  { id: "en_conversacion", name: "En Conversación", color: "#6366F1" },
  { id: "opciones_enviadas", name: "Opciones Enviadas", color: "#8B5CF6" },
  { id: "vehiculo_elegido", name: "Vehículo Elegido", color: "#FBBF24" },
  { id: "asesor", name: "Paso a Asesor", color: "#F97316" },
  { id: "venta_realizada", name: "Venta Realizada", color: "#22C55E" },
  { id: "sin_opcion", name: "Sin Opción", color: "#A1A1AA" },
  { id: "no_cualificado", name: "No Cualificado", color: "#EF4444" },
];

type LeadCount = {
  status: string;
  count: number;
};

interface LeadFunnelChartProps {
  leadCounts: LeadCount[];
}

export function LeadFunnelChart({ leadCounts }: LeadFunnelChartProps) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    const statusMap = new Map<string, number>();

    // Initialize all counts to 0
    leadCounts.forEach((item) => {
      statusMap.set(item.status, Number(item.count));
    });

    // Create data array for main funnel stages
    return FUNNEL_STAGES.map((stage) => ({
      name: stage.name,
      count: statusMap.get(stage.id) || 0,
      color: stage.color,
      id: stage.id,
    }));
  }, [leadCounts]);

  type TooltipProps = {
    active?: boolean;
    payload?: {
      value: number;
      payload: {
        name: string;
        count: number;
        color: string;
        id: string;
      };
    }[];
    label?: string;
  };

  // Custom tooltip with proper typing
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-popover border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (!leadCounts || leadCounts.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No lead data available</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
