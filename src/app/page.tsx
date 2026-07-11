import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <LatestQuestions />
          </div>
          <div className="w-full md:w-1/3">
            <TopContributers />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}