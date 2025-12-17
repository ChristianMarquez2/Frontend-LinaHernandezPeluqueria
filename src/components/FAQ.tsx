import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "¿Cómo puedo reservar una cita?",
    answer: "Puedes reservar tu cita a través de nuestro formulario de contacto en esta página, por WhatsApp o llamando directamente a nuestro número de teléfono. Te confirmaremos la disponibilidad inmediatamente.",
  },

  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard), y transferencias bancarias. También trabajamos con billeteras digitales como DeUna.",
  },
  {
    question: "¿Cuánto tiempo dura cada servicio?",
    answer: "Los tiempos varían según el servicio: cortes (30-45 min), color/tinte (1.5-2 hrs), keratina (3 hrs), peinados (1 hr). Te informaremos el tiempo estimado al momento de la reserva.",
  },

  {
    question: "¿Los productos son de calidad profesional?",
    answer: "Absolutamente. Trabajamos únicamente con productos profesionales de alta gama reconocidos en la industria, garantizando resultados excepcionales y cuidado óptimo de tu cabello.",
  },
  {
    question: "¿Necesito traer algo para mi cita?",
    answer: "No es necesario traer nada. Proporcionamos todos los materiales y productos necesarios. Solo ven con tu cabello limpio (excepto para servicios de color donde te indicaremos).",
  },
  {
    question: "¿Ofrecen consultas previas?",
    answer: "Sí, ofrecemos consultas gratuitas para servicios de color y transformaciones importantes. Así podemos evaluar tu cabello y diseñar el mejor plan para lograr el resultado que deseas.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
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
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg px-6 data-[state=open]:border-[#D4AF37]/50 transition-all"
              >
                <AccordionTrigger className="text-left hover:text-[#D4AF37] transition-colors">
                  <span className="text-[#F4E5C2]">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
