import { Card } from "./ui/card";
import { motion } from "motion/react";
import { MapPin, Clock, Phone } from "lucide-react";

export function Location() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="mb-4 bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] bg-clip-text text-transparent"
            style={{ fontSize: "2.5rem" }}
          >
            Encuéntranos
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Visítanos en nuestro salón y descubre la diferencia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/20 p-8 h-full">
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" style={{ color: "#D4AF37" }} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-[#F4E5C2]">Dirección</h3>
                    <p className="text-gray-400">
                      Calle 45 #23-15, Barrio El Poblado<br />
                      Medellín, Antioquia<br />
                      Colombia
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6" style={{ color: "#E91E8C" }} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-[#F4E5C2]">Horario de Atención</h3>
                    <div className="text-gray-400 space-y-1">
                      <p>Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                      <p>Sábados: 9:00 AM - 6:00 PM</p>
                      <p>Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6" style={{ color: "#D4AF37" }} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-[#F4E5C2]">Teléfono</h3>
                    <p className="text-gray-400">
                      +57 300 123 4567<br />
                      <span className="text-gray-500" style={{ fontSize: "0.9rem" }}>
                        También disponible por WhatsApp
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/20 p-2 h-full overflow-hidden">
              <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1234567890!2d-75.5678901234567!3d6.234567890123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTQnMDQuNCJOIDc1wrAzNCcwNC40Ilc!5e0!3m2!1ses!2sco!4v1234567890123!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Lina Hernández Peluquería"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
