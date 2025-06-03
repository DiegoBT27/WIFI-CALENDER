
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell } from "recharts";
import type { ServiceType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DashboardChartsProps {
  totalCustomersData: Array<{ name: string; value: number; fill: string }>;
  serviceTypeData: Array<{ name: ServiceType | string; value: number; fill: string }>;
  totalMonthlyIncome: number;
}

const chartConfig = {
  clientes: { label: "Clientes", color: "hsl(var(--chart-3))" },
  router: { label: "router", color: "hsl(var(--chart-1))" },
  eap: { label: "eap", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export function DashboardCharts({
  totalCustomersData,
  serviceTypeData,
  totalMonthlyIncome,
}: DashboardChartsProps) {
  
  const totalCustomersCount = totalCustomersData.length > 0 ? totalCustomersData[0].value : 0;
  const routerCount = serviceTypeData.find(d => d.name === 'router')?.value || 0;
  const eapCount = serviceTypeData.find(d => d.name === 'eap')?.value || 0;
  
  const hasTotalCustomerData = totalCustomersCount > 0;
  const hasServiceData = routerCount > 0 || eapCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="items-center text-center pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Total de Clientes</CardTitle>
          {totalCustomersCount > 0 && (
            <div className="text-2xl font-bold text-primary pt-1">{totalCustomersCount}</div>
          )}
          <CardDescription className="text-xs text-muted-foreground pt-1">
            Ingreso Mensual Total Estimado: <span className="font-semibold text-primary">{formatCurrency(totalMonthlyIncome)}</span>
          </CardDescription>
          {!hasTotalCustomerData && <CardDescription className="text-xs text-muted-foreground pt-1">No hay clientes registrados.</CardDescription>}
        </CardHeader>
        <CardContent className="h-[120px] flex items-center justify-start px-3">
          {hasTotalCustomerData ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={totalCustomersData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }} 
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical />
                <XAxis 
                  type="number" 
                  tickLine={false} 
                  axisLine={{ strokeOpacity: 0.5 }}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), dataMax + 2, 5)]} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {totalCustomersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
             <div className="h-full w-full flex items-center justify-center">
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="items-center text-center pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Clientes por Servicio</CardTitle>
           {(!hasServiceData) && <CardDescription className="text-xs text-muted-foreground pt-1">No hay datos de servicio.</CardDescription>}
        </CardHeader>
        <CardContent className="h-[120px] flex items-center justify-start px-3">
          {hasServiceData ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={serviceTypeData.filter(d => d.value > 0)} // Filter out zero-value services for chart
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }} 
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical />
                <XAxis 
                  type="number" 
                  tickLine={false} 
                  axisLine={{ strokeOpacity: 0.5 }}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), dataMax + 2, 5)]} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {serviceTypeData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
            </div>
          )}
        </CardContent>
        {(routerCount > 0 || eapCount > 0) && (
          <CardFooter className="pt-2 pb-3 flex justify-start items-center text-sm gap-6">
            {routerCount > 0 && (
              <div className="text-center">
                <div className="font-bold text-lg text-chart-1">{routerCount}</div>
                <div className="text-xs text-muted-foreground">Routers</div>
              </div>
            )}
            {eapCount > 0 && (
              <div className="text-center">
                <div className="font-bold text-lg text-chart-2">{eapCount}</div>
                <div className="text-xs text-muted-foreground">EAPs</div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
