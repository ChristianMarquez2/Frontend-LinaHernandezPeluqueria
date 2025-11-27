import { useState } from "react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Calendar } from "lucide-react";
import { LoginDialog } from "./LoginDialog";

export function CTABanner() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#9D8EC1]/10 to-[#D4AF37]/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2
            className="mb-4 bg-gradient-to-r from-[#E5E4E2] to-[#B8A9D4] bg-clip-text text-transparent"
            style={{ fontSize: "2rem" }}
          >
            Dale a tu cabello el cuidado que merece
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontSize: "1.125rem" }}>
            No esperes más para lucir radiante. Agenda tu cita hoy mismo.
          </p>
          
          <Button
            size="lg"
            onClick={() => setIsLoginOpen(true)}
            className="bg-gradient-to-r from-[#9D8EC1] to-[#B8A9D4] text-white hover:shadow-2xl hover:shadow-[#9D8EC1]/50 transition-all px-10 py-6"
            style={{ fontSize: "1.125rem" }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agenda tu cita ahora
          </Button>
        </motion.div>
      </div>
      
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </section>
  );
}
