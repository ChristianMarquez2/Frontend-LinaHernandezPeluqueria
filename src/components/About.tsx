
import LinaHernandez from "../imagenes/LinaHernandez.jpeg";
import { motion } from "motion/react";
import { Target, Eye, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function About() {
  return (
    <section id="nosotros" className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
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
            Sobre Nosotros
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/20">
              <ImageWithFallback
                src={LinaHernandez}
                alt="Lina Hernández"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="mb-4 text-[#F4E5C2]">Lina Hernández</h3>
              <p className="text-gray-400 leading-relaxed">
                Con más de 10 años de experiencia en el mundo de la belleza, me dedico a transformar la imagen de cada cliente, resaltando su estilo único y personalidad. Mi pasión es el arte del color y el diseño de cortes que realzan la belleza natural.
              </p>
            </div>

            {/* Misión */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" style={{ color: "#D4AF37" }} />
                </div>
                <div>
                  <h4 className="mb-2 text-[#F4E5C2]">Nuestra Misión</h4>
                  <p className="text-gray-400" style={{ fontSize: "0.9rem" }}>
                    Brindar servicios de alta calidad con profesionalismo, calidez y dedicación, haciendo que cada visita sea una experiencia única de belleza y bienestar.
                  </p>
                </div>
              </div>
            </div>

            {/* Visión */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6" style={{ color: "#E91E8C" }} />
                </div>
                <div>
                  <h4 className="mb-2 text-[#F4E5C2]">Nuestra Visión</h4>
                  <p className="text-gray-400" style={{ fontSize: "0.9rem" }}>
                    Ser reconocidos como el salón de belleza líder en la región, referente en innovación, calidad y excelencia en servicios de estilismo profesional.
                  </p>
                </div>
              </div>
            </div>

            {/* Awards/Recognition */}
            <div className="flex items-center gap-3 pt-4">
              <Award className="w-8 h-8" style={{ color: "#D4AF37" }} />
              <p className="text-gray-400" style={{ fontSize: "0.9rem" }}>
                Certificación en colorimetría avanzada y técnicas de vanguardia
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
