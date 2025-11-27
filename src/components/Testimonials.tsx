import { Card } from "./ui/card";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "María Rodríguez",
    rating: 5,
    comment: "Excelente servicio! Lina es una artista del color. Quedé encantada con mi nuevo look. Totalmente recomendado.",
    date: "Hace 2 semanas",
  },
  {
    name: "Carolina Méndez",
    rating: 5,
    comment: "El mejor salón de la ciudad. Atención personalizada, ambiente agradable y resultados increíbles. Volveré seguro!",
    date: "Hace 1 mes",
  },
  {
    name: "Andrea López",
    rating: 5,
    comment: "Me hice la keratina y quedó espectacular. Mi cabello nunca había lucido tan hermoso y saludable. Gracias Lina!",
    date: "Hace 3 semanas",
  },
  {
    name: "Valentina Torres",
    rating: 5,
    comment: "Profesionalismo de primer nivel. Lina sabe exactamente qué estilo me queda mejor. Siempre salgo feliz del salón.",
    date: "Hace 1 semana",
  },
  {
    name: "Camila Ruiz",
    rating: 5,
    comment: "Llevo años viniendo y nunca me ha decepcionado. Los productos son de alta calidad y el trato es excepcional.",
    date: "Hace 2 meses",
  },
  {
    name: "Daniela Castro",
    rating: 5,
    comment: "El cambio de color que me hizo fue perfecto! Superó mis expectativas. Es mi estilista de confianza.",
    date: "Hace 3 días",
  },
];

export function Testimonials() {
  return (
    <section id="testimonios" className="py-24 bg-[#0A0A0A]">
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
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestro mayor orgullo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/20 p-6 h-full hover:border-[#D4AF37]/40 transition-all hover:shadow-lg hover:shadow-[#D4AF37]/10">
                <div className="flex flex-col h-full">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-[#D4AF37]/30" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#D4AF37]"
                        style={{ color: "#D4AF37" }}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-300 mb-6 flex-grow" style={{ fontSize: "0.9rem" }}>
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <div className="pt-4 border-t border-[#D4AF37]/20">
                    <p className="text-[#F4E5C2]" style={{ fontSize: "0.95rem" }}>
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
