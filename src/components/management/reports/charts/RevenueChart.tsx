import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface RevenueChartProps {
  data: { date: string; revenue: number }[]; // date en vez de month
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 col-span-2 lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <CardTitle className="text-white">Tendencia de Ingresos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              name="Ingresos Diarios"
              strokeWidth={3}
              dot={{ r: 3, fill: '#10B981' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}