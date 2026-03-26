import Navbar from '@/components/Navbar';
import HeroSection from '@/components/cliente/HeroSection';
import ServicesSection from '@/components/cliente/ServicesSection';
import TeamSection from '@/components/cliente/TeamSection';
import BookingSection from '@/components/cliente/BookingSection';
import InfoSection from '@/components/cliente/InfoSection';

const Index = () => {
  const scrollToBooking = () => {
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onBookClick={scrollToBooking} />
      <ServicesSection />
      <TeamSection />
      <BookingSection />
      <InfoSection />
    </div>
  );
};

export default Index;
