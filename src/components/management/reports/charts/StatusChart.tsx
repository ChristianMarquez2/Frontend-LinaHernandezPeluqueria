import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10B981', '#D4AF37', '#EF4444', '#6B7280', '#3B82F6', '#9D8EC1'];

interface StatusChartProps {
  data: { name: string; value: number }[];
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-white">Estado de las Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}