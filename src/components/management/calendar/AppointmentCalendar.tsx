import { useEffect } from 'react'; // Importamos useEffect
import { Calendar as CalendarIcon, Filter, XCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { cn } from '../../ui/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAppointmentCalendar } from './useAppointmentCalendar';
import { AppointmentCard } from './AppointmentCard';
import { useAuth } from '../../../contexts/auth/index'; // 🔥 Importamos Auth

export function AppointmentCalendar() {
   const { user } = useAuth(); // 🔥 Obtenemos el usuario actual
   
   const {
      bookings,
      loading,
      selectedDate, setSelectedDate,
      selectedStylistId, setSelectedStylistId,
      selectedStatus, setSelectedStatus,
      viewAllDates, setViewAllDates,
      stylists,
      formatDateLabel, formatTime,
      getServiceName, getClientLabel, getStylistLabel,
      handleConfirm, handleCancel, handleComplete
   } = useAppointmentCalendar();

   // 🔥 LÓGICA DE PERMISOS
   // Determinamos si el usuario es un estilista para restringir la vista
   const isStylist = user?.role === 'stylist';

   // 🔥 EFECTO DE AUTO-SELECCIÓN
   // Si es estilista, forzamos que la variable selectedStylistId sea SIEMPRE su propio ID
   useEffect(() => {
      if (isStylist && user?.id) {
         // Si no está seleccionado o está seleccionado otro, lo forzamos a él mismo
         if (selectedStylistId !== user.id) {
            setSelectedStylistId(user.id);
         }
      }
   }, [isStylist, user, selectedStylistId, setSelectedStylistId]);


   // Helper para manejar el cambio del input nativo
   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
         setSelectedDate(new Date(`${e.target.value}T12:00:00`));
      } else {
         setSelectedDate(undefined as any);
      }
   };

   const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <Card className="bg-gray-900 border-gray-800 shadow-xl">
            <CardHeader className="flex flex-col gap-6 pb-6 border-b border-gray-800">

               {/* Header Superior */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                     <CalendarIcon className="h-6 w-6 text-[#D4AF37]" />
                     Gestión de Citas
                  </CardTitle>

                  <Button
                     size="sm"
                     onClick={() => setViewAllDates(!viewAllDates)}
                     className={`btn-purple-base ${viewAllDates ? "btn-purple-neon" : "btn-purple-idle"}`}
                  >
                     {viewAllDates ? "Mostrando Todo" : "Modo: Por Fecha"}
                  </Button>
               </div>

               {/* Barra de Herramientas (Filtros) */}
               <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

                  {/* 1. Selector de Fecha */}
                  {!viewAllDates && (
                     <div className="md:col-span-4">
                        <div className="relative">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <CalendarIcon className="h-4 w-4 text-[#D4AF37]" />
                           </div>
                           <input
                              type="date"
                              value={dateValue}
                              onChange={handleDateChange}
                              className={cn(
                                 "w-full bg-black border border-gray-700 text-white rounded-md pl-10 pr-3 py-2",
                                 "focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all",
                                 "text-sm h-10 placeholder-gray-500"
                              )}
                              style={{ colorScheme: 'dark' }}
                           />
                        </div>
                     </div>
                  )}

                  {/* 2. Filtro Estilista (OCULTO PARA ESTILISTAS) */}
                  {/* 🔥 Solo mostramos este select si NO es estilista */}
                  {!isStylist && (
                     <div className={`${viewAllDates ? 'md:col-span-6' : 'md:col-span-4'}`}>
                        <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
                           <SelectTrigger className="bg-black border-gray-700 text-white w-full h-10">
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
                  )}

                  {/* 3. Filtro Estado */}
                  {/* 🔥 Ajustamos el tamaño de la columna dinámicamente si el filtro de estilista está oculto */}
                  <div className={`${
                     viewAllDates 
                        ? (isStylist ? 'md:col-span-12' : 'md:col-span-6') // Si ve todo y es estilista, ocupa todo el ancho
                        : (isStylist ? 'md:col-span-8' : 'md:col-span-4')  // Si ve fecha y es estilista, ocupa el resto
                  }`}>
                     <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="bg-black border-gray-700 text-white w-full h-10">
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