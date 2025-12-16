"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";

import { cn } from "./utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  modifiers,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      modifiers={modifiers} // Pasamos los modificadores (booked)
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-gray-700 text-white hover:bg-gray-800"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        // 🔥 ESTILOS CLAVE PARA ARREGLAR LA VISUALIZACIÓN
        table: "w-full border-collapse space-y-1 block", // 'block' ayuda a forzar estructura
        head_row: "flex w-full justify-between", // Alinea los días de la semana
        head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] uppercase flex justify-center",
        
        row: "flex w-full mt-2 justify-between", // Alinea los números horizontalmente
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        
        // 🔥 text-sm AQUÍ es vital para vencer a tu global.css
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex flex-col items-center justify-center gap-[2px]" 
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#D4AF37] text-black hover:bg-[#D4AF37] hover:text-black focus:bg-[#D4AF37] focus:text-black font-bold rounded-md",
        day_today: "bg-gray-800 text-white font-bold border border-gray-600 rounded-md",
        day_outside:
          "day-outside text-gray-600 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-500",
        day_disabled: "text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-800 aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      // 🔥 RENDERIZADO PERSONALIZADO PARA EL PUNTITO DE CITAS
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        DayContent: (props) => {
            const { date, activeModifiers } = props;
            const isBooked = activeModifiers.booked;
            
            return (
                <div className="relative flex items-center justify-center w-full h-full">
                    <span className="z-10">{date.getDate()}</span>
                    {/* Si tiene cita (booked), mostramos un puntito dorado abajo */}
                    {isBooked && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                    )}
                </div>
            );
        }
      }}
      {...props}
    />
  );
}

export { Calendar };