import { Card } from "./ui/card";
import { motion } from "motion/react";
import { Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

interface Service {
  title: string;
  description: string;
  price: string;
  duration: string;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Intentar obtener servicios sin autenticación primero (endpoint público)
        const response = await fetch(`${API_BASE_URL}/services`);
        
        if (!response.ok) {
          console.warn("No se pudieron obtener los servicios de la API");
          setServices([]);
          return;
        }

        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const formattedServices = data.map((service: any) => {
            
            return {
              title: service.nombre || service.name || "",
              description: service.descripcion || service.description || "",
              price: `$${service.precio || service.price || "0"}`,
              duration: service.duracionMin ? `${service.duracionMin} min` : service.duracion || service.duration || service.tiempo || service.time || "N/A",
            };
          });
          setServices(formattedServices);
        } else if (data) {
          // Si data es un objeto con una propiedad que contiene el array
          const servicesArray = data.data || data.services || [];
          if (Array.isArray(servicesArray)) {
            const formattedServices = servicesArray.map((service: any) => {
              
              return {
                title: service.nombre || service.name || "",
                description: service.descripcion || service.description || "",
                price: `$${service.precio || service.price || "0"}`,
                duration: service.duracionMin ? `${service.duracionMin} min` : service.duracion || service.duration || service.tiempo || service.time || "N/A",
              };
            });
            setServices(formattedServices);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  return (
    <section id="servicios" className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="mb-4 bg-gradient-to-r from-[#D4AF37] to-[#E5E4E2] bg-clip-text text-transparent"
            style={{ fontSize: "2.5rem" }}
          >
            Nuestros Servicios
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios profesionales para realzar tu belleza
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400">
              Cargando servicios...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">
              No hay servicios disponibles
            </div>
          ) : (
            services.map((service, index) => (
              <motion.div
                key={`${service.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all hover:shadow-lg hover:shadow-[#D4AF37]/10 p-6 h-full group cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#9D8EC1]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Scissors className="w-7 h-7" style={{ color: "#D4AF37" }} />
                      </div>
                    </div>
                    
                    <h3 className="mb-2 text-[#E5E4E2]">{service.title}</h3>
                    <p className="text-gray-400 mb-4 flex-grow" style={{ fontSize: "0.9rem" }}>
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/20">
                      <span className="text-[#D4AF37]" style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                        {service.price}
                      </span>
                      <span className="text-gray-500" style={{ fontSize: "0.875rem" }}>
                        {service.duration}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
