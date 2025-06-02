
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from "recharts";
import type { ServiceType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DashboardChartsProps {
  totalCustomersData: Array<{ name: string; value: number; fill: string }>;
  serviceTypeData: Array<{ name: ServiceType | string; value: number; fill: string }>;
  totalMonthlyIncome: number;
}

const chartConfig = {
  customers: { label: "Clientes", color: "hsl(var(--chart-3))" },
  ROUTER: { label: "Router", color: "hsl(var(--chart-1))" },
  EAP: { label: "EAP", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function DashboardCharts({
  totalCustomersData,
  serviceTypeData,
  totalMonthlyIncome,
}: DashboardChartsProps) {
  
  const hasTotalCustomerData = totalCustomersData.length > 0 && totalCustomersData[0].value > 0;
  const hasServiceData = serviceTypeData.some(d => d.value > 0);

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    
    if (width < 20 || value === 0) { 
      return null;
    }

    return (
      <g>
        <text 
          x={x + width - 7} 
          y={y + height / 2} 
          fill="hsl(var(--primary-foreground))" 
          textAnchor="end" 
          dominantBaseline="middle"
          fontSize={10}
          fontWeight="bold"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="items-center text-center pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Total de Clientes</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Ingreso Mensual Total Estimado: <span className="font-semibold text-primary">{formatCurrency(totalMonthlyIncome)}</span>
          </CardDescription>
          {!hasTotalCustomerData && totalMonthlyIncome === 0 && <CardDescription className="text-xs text-muted-foreground pt-1">No hay clientes.</CardDescription>}
        </CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center"> {/* Reduced height */}
          {hasTotalCustomerData ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={totalCustomersData}
                layout="vertical"
                margin={{ top: 5, right: 35, left: 10, bottom: 0 }} // Increased right margin
                barSize={20} // Reduced bar size
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical />
                <XAxis 
                  type="number" 
                  tickLine={false} 
                  axisLine={{ strokeOpacity: 0.5 }}
                  tick={{ fontSize: 10 }} 
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10 }} 
                  width={45}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`${value}`, chartConfig[name as keyof typeof chartConfig]?.label || name as string]}
                    indicator="dot" 
                  />}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {totalCustomersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" content={renderCustomizedLabel} />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
             <div className="h-full flex items-center justify-center">
               <p className="text-muted-foreground text-sm">0</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="items-center text-center pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Clientes por Servicio</CardTitle>
           {!hasServiceData && <CardDescription className="text-xs text-muted-foreground">No hay datos de servicio.</CardDescription>}
        </CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center"> {/* Reduced height */}
          {hasServiceData ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={serviceTypeData}
                layout="vertical"
                margin={{ top: 5, right: 35, left: 10, bottom: 0 }} // Increased right margin
                barSize={20} // Reduced bar size
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical />
                <XAxis 
                  type="number" 
                  tickLine={false} 
                  axisLine={{ strokeOpacity: 0.5 }}
                  tick={{ fontSize: 10 }} 
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10 }} 
                  width={45}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`${value}`, chartConfig[name as keyof typeof chartConfig]?.label || name as string]}
                    indicator="dot" 
                  />}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" content={renderCustomizedLabel} />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">N/A</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


    