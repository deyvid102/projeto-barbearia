import Navbar from '@/components/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import TeamSection from '@/components/landing/TeamSection';
import BookingSection from '@/components/landing/BookingSection';
import InfoSection from '@/components/landing/InfoSection';

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
