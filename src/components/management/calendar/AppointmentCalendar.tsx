import { Calendar as CalendarIcon, Filter, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar'; 
import { cn } from '../../ui/utils'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAppointmentCalendar } from './useAppointmentCalendar';
import { AppointmentCard } from './AppointmentCard';

export function AppointmentCalendar() {
  const {
    bookings,
    loading,
    selectedDate, setSelectedDate,
    selectedStylistId, setSelectedStylistId,
    selectedStatus, setSelectedStatus,
    viewAllDates, setViewAllDates,
    bookedDates,
    stylists,
    formatDateLabel, formatTime,
    getServiceName, getClientLabel, getStylistLabel,
    handleConfirm, handleCancel, handleComplete
  } = useAppointmentCalendar();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="flex flex-col gap-6 pb-6 border-b border-gray-800">
          
          {/* Header Superior: Título y Toggle Principal */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <CardTitle className="text-white flex items-center gap-2 text-xl">
                <CalendarIcon className="h-6 w-6 text-[#D4AF37]" />
                Gestión de Citas
             </CardTitle>
             
             <Button 
                size="sm" 
                variant={viewAllDates ? "default" : "outline"}
                onClick={() => setViewAllDates(!viewAllDates)}
                className={viewAllDates 
                    ? "bg-[#D4AF37] text-black hover:bg-[#b5952f] font-medium" 
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"}
             >
                {viewAllDates ? "Mostrando Todo" : "Modo: Por Fecha"}
             </Button>
          </div>
          
          {/* Barra de Herramientas (Filtros) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
             
             {/* 1. Selector de Fecha (Oculto si vemos todo) - Ocupa 4 columnas */}
             {!viewAllDates && (
                <div className="md:col-span-4">
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal bg-black border-gray-700 text-white hover:bg-gray-800",
                            !selectedDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#D4AF37]" />
                        {selectedDate ? format(selectedDate, "PPPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800" align="start">
                        <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        modifiers={{ booked: bookedDates }}
                        modifiersStyles={{ 
                            booked: { 
                                border: '1px solid #D4AF37', 
                                color: '#D4AF37',
                                fontWeight: 'bold' 
                            } 
                        }}
                        className="text-white bg-gray-900"
                        />
                    </PopoverContent>
                    </Popover>
                </div>
             )}

             {/* 2. Filtro Estilista - Ocupa 4 o 6 columnas dependiendo del modo */}
             <div className={`${viewAllDates ? 'md:col-span-6' : 'md:col-span-4'}`}>
                <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
                   <SelectTrigger className="bg-black border-gray-700 text-white w-full">
                      <SelectValue placeholder="Filtrar por Estilista" />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="ALL">Todos los Estilistas</SelectItem>
                      {stylists.map(s => (
                         <SelectItem key={s._id} value={s._id}>{s.nombre} {s.apellido}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>

             {/* 3. Filtro Estado - Ocupa 4 o 6 columnas */}
             <div className={`${viewAllDates ? 'md:col-span-6' : 'md:col-span-4'}`}>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                   <SelectTrigger className="bg-black border-gray-700 text-white w-full">
                      <div className="flex items-center gap-2">
                         <Filter className="h-3 w-3 opacity-70" />
                         <SelectValue placeholder="Estado de Cita" />
                      </div>
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value="SCHEDULED">Pendientes</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                      <SelectItem value="COMPLETED">Completadas</SelectItem>
                      <SelectItem value="CANCELLED">Canceladas</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6 bg-gray-900/50 min-h-[400px]">
           <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-4">
                <h3 className="text-[#D4AF37] font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                    {viewAllDates ? "Historial Completo" : `Agenda del ${formatDateLabel(selectedDate)}`}
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">{bookings.length}</span>
                </h3>
           </div>

           {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#9D8EC1] animate-pulse">
                <Search className="h-10 w-10 mb-4 opacity-50" />
                <p>Consultando agenda...</p>
              </div>
           ) : bookings.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-black/20">
                <XCircle className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium text-gray-400">No se encontraron citas</p>
                <p className="text-sm">Prueba ajustando los filtros seleccionados</p>
             </div>
           ) : (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {bookings.map((booking) => (
                 <AppointmentCard
                   key={booking._id}
                   booking={booking}
                   formatTime={formatTime}
                   getServiceName={getServiceName}
                   getClientLabel={getClientLabel}
                   getStylistLabel={getStylistLabel}
                   onConfirm={handleConfirm}
                   onCancel={(id) => {
                       const motivo = prompt("Motivo de la cancelación:");
                       if (motivo) handleCancel(id, motivo);
                   }}
                   onComplete={(id) => handleComplete(id, "Completado desde panel")}
                 />
               ))}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}