import Hero from "@/components/Hero";
import MainMenu from "@/components/MainMenu";
import AboutSection from "@/components/AboutSection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <MainMenu />
      <AboutSection />
      <ContactForm />
      <Footer />
    </main>
  );
}