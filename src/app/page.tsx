import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { StatsBar } from "@/components/landing/StatsBar";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/Footer";

const products = [
  { title: "Dashboard Overview", link: "#", thumbnail: "/screenshots/ss-01.png" },
  { title: "Lead Pipeline",      link: "#", thumbnail: "/screenshots/ss-02.png" },
  { title: "Lead Enrichment",    link: "#", thumbnail: "/screenshots/ss-03.png" },
  { title: "Score Output",       link: "#", thumbnail: "/screenshots/ss-04.png" },
  { title: "Kanban Board",       link: "#", thumbnail: "/screenshots/ss-05.png" },
  { title: "Analytics",          link: "#", thumbnail: "/screenshots/ss-06.png" },
  { title: "Lead Profile",       link: "#", thumbnail: "/screenshots/ss-07.png" },
  { title: "Login Page",         link: "#", thumbnail: "/screenshots/ss-08.png" },
  { title: "City Intelligence",  link: "#", thumbnail: "/screenshots/ss-09.png" },
  { title: "Dashboard Overview", link: "#", thumbnail: "/screenshots/ss-01.png" },
  { title: "Lead Pipeline",      link: "#", thumbnail: "/screenshots/ss-02.png" },
  { title: "Lead Enrichment",    link: "#", thumbnail: "/screenshots/ss-03.png" },
  { title: "Score Output",       link: "#", thumbnail: "/screenshots/ss-04.png" },
  { title: "Kanban Board",       link: "#", thumbnail: "/screenshots/ss-05.png" },
  { title: "Analytics",          link: "#", thumbnail: "/screenshots/ss-06.png" },
];

export default function Home() {
  return (
    <>
    <FloatingNavbar />
    <main>
      <HeroParallax products={products} />
      <StatsBar />
      <FeatureCards />
      <CTABanner />
    </main>
    <Footer />
    </>
  );
}
