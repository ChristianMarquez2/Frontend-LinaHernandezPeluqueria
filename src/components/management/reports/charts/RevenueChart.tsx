import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RatingsChartProps {
  data: { name: string; rating: number; reviews: number }[];
}

export function RatingsChart({ data }: RatingsChartProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-white">Satisfacción por Estilista</CardTitle>
        <CardDescription>Promedio de calificación recibida</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
              formatter={(value: number) => [`${value} ⭐`, 'Promedio']}
            />
            <Bar dataKey="rating" fill="#FFD700" name="Calificación Promedio" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
export default RatingsChart;
