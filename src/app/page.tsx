import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";

export default function Page() {
  return (
    <main>
      <Header />
      <div className="[--page-pad:clamp(20px,6vw,32px)] sm:[--page-pad:clamp(16px,4vw,32px)]">
        <HomeHero />
      </div>

      {/* секція для скролу вниз */}

    </main>
  );
}
