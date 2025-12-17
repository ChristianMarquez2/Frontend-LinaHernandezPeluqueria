import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth/index"; 
import { DataProvider } from "./contexts/data/index";
// 1. Importar el nuevo Provider
import { CategoriesProvider } from "./contexts/data/context/CategoriesContext"; 

import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { CTABanner } from "./components/CTABanner";
import { Portfolio } from "./components/Portfolio";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Location } from "./components/Location";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { DashboardRouter } from "./components/DashboardRouter";
import { Toaster } from "./components/ui/sonner";


function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect any deep link back to home when the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (isAuthenticated) {
    return <DashboardRouter />;
  }

  return (
    <div className="dark min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <Services />
        <CTABanner />
        <Portfolio />
        <About />
        <Testimonials />
        <FAQ />
        <Location />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        {/* 2. Envolver AppContent con CategoriesProvider */}
        <CategoriesProvider>
           <AppContent />
           <Toaster />
        </CategoriesProvider>
      </DataProvider>
    </AuthProvider>
  );
}