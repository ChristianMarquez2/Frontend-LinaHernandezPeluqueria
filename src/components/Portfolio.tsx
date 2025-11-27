import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const portfolioItems = [
  {
    title: "Transformación de Color",
    before: "https://images.unsplash.com/photo-1590503347339-ccd768ad83d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwdHJhbnNmb3JtYXRpb24lMjBiZWZvcmUlMjBhZnRlcnxlbnwxfHx8fDE3NjExODE0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    after: "https://images.unsplash.com/photo-1712213396688-c6f2d536671f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY29sb3JpbmclMjBzYWxvbnxlbnwxfHx8fDE3NjEyMzEwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Corte Moderno",
    before: "https://images.unsplash.com/photo-1660505102581-85cffa4e6550?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGhhaXJjdXQlMjBzYWxvbnxlbnwxfHx8fDE3NjExNDA4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    after: "https://images.unsplash.com/photo-1712641966879-63f3bc1a47e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc3R5bGluZyUyMGJlYXV0eXxlbnwxfHx8fDE3NjEyMzEwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function Portfolio() {
  return (
    <section id="portafolio" className="py-24 bg-[#0A0A0A]">
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
            Nuestro Portafolio
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Resultados reales que hablan por sí solos. Antes y después de nuestros trabajos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all">
                <div className="p-4">
                  <h3 className="mb-4 text-center text-[#F4E5C2]">{item.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-2 text-center">
                        <span className="inline-block px-3 py-1 bg-gray-800 rounded-full text-gray-400" style={{ fontSize: "0.75rem" }}>
                          Antes
                        </span>
                      </div>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#D4AF37]/10">
                        <ImageWithFallback
                          src={item.before}
                          alt={`${item.title} - Antes`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-2 text-center">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#E91E8C]/20 rounded-full text-[#D4AF37]" style={{ fontSize: "0.75rem" }}>
                          Después
                        </span>
                      </div>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#D4AF37]/30">
                        <ImageWithFallback
                          src={item.after}
                          alt={`${item.title} - Después`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
