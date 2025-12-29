import { TrendingUp, CalendarDays, Users, Scissors, Star, Clock, Calendar } from 'lucide-react';
import { Layers } from 'lucide-react';
import { Tag } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { useData } from '../../../contexts/data';
import { CreditCard } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/card';
import { Badge } from '../../ui/badge';

export function ManagerOverview() {
  const sections = [
    {
      id: 'agenda',
      title: 'Agenda de Citas',
      icon: <CalendarDays className="h-5 w-5 text-[#D4AF37]" />,
      description: 'Consulta, filtra y gestiona todas las citas del día o historial completo.',
      features: [
        'Filtrar por fecha, estilista y estado',
        'Confirmar, completar o cancelar citas',
        'Ver detalles de cliente y servicio',
      ],
    },

    {
      id: 'estilistas',
      title: 'Gestión de Estilistas',
      icon: <Scissors className="h-5 w-5 text-purple-400" />,
      description: 'Gestiona el equipo, sus perfiles y servicios ofrecidos.',
      features: [
        'Perfil y estado activo',
        'Servicios que atiende cada estilista',
        'Disponibilidad y horarios asociados',
      ],
    },
    {
      id: 'turnos',
      title: 'Horarios de atención',
      icon: <Calendar className="h-5 w-5 text-[#D4AF37]" />,
      description: 'Define la disponibilidad por día, genera slots y administra excepciones.',
      features: [
        'Plantillas por día de la semana',
        'Bloques y excepciones por fecha',
        'Generación automática de slots por servicio',
      ],
    },
    
    
    
    {
      id: 'servicios',
      title: 'Servicios',
      icon: <Tag className="h-5 w-5 text-pink-400" />,
      description: 'Administra el catálogo de servicios: precio, duración y estado.',
      features: [
        'Crear y editar servicios',
        'Precio, duración y visibilidad',
        'Asociación con categorías y estilistas',
      ],
    },
    {
      id: 'calificaciones',
      title: 'Calificaciones',
      icon: <Star className="h-5 w-5 text-yellow-400" />,
      description: 'Visualiza reseñas, promedio de estrellas y comentarios recientes.',
      features: [
        'Listado y filtro de calificaciones',
        'Promedios por estilista',
        'Detalle de comentarios',
      ],
    },
    {
      id: 'pagos',
      title: 'Pagos y Comprobantes',
      icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
      description: 'Administra comprobantes de transferencias y confirma pagos de reservas.',
      features: [
        'Lista de comprobantes con cliente, servicio y estado',
        'Visualización y descarga del comprobante enviado',
        'Confirmación de pagos pendientes',
      ],
    },
    {
      id: 'reportes',
      title: 'Reportes y Estadísticas',
      icon: <BarChart3 className="h-5 w-5 text-[#9D8EC1]" />,
      description: 'Analiza ingresos, rendimiento y estados de reservas. Exporta a PDF.',
      features: [
        'Resumen financiero por rango de fechas',
        'Desglose por estilista y servicio',
        'Descarga de reportes en PDF',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D4AF37] text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Panel de Administración
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id} className="bg-gray-900 border-gray-800 hover:border-[#D4AF37]/40 transition-colors">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-gray-400">
                {section.description}
              </CardDescription>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {section.features.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
