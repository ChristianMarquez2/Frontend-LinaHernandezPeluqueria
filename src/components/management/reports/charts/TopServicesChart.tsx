import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopServicesChartProps {
  data: { name: string; count: number }[];
}

export function TopServicesChart({ data }: TopServicesChartProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-white">Servicios Más Populares</CardTitle>
        <CardDescription>Top 10 servicios solicitados</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9ca3af' }} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: '#374151', opacity: 0.2 }}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
            />
            <Bar dataKey="count" fill="#9D8EC1" name="Cantidad de Citas" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}