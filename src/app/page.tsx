import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { StatsBar } from "@/components/landing/StatsBar";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/Footer";

const products = [
  { title: "Lead Enrichment",    thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/moonbeam.png" },
  { title: "AI Lead Scoring",    thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/cursor.png" },
  { title: "Outreach Email",     thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/rogue.png" },
  { title: "City Intelligence",  thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/editorially.png" },
  { title: "News Feed",          thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/editrix.png" },
  { title: "CSV Batch Upload",   thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/pixelperfect.png" },
  { title: "Score Dashboard",    thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/algochurn.png" },
  { title: "Sales Insights",     thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/aceternityui.png" },
  { title: "Pipeline View",      thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png" },
  { title: "Lead Profile",       thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/smartbridge.png" },
  { title: "API Enrichment",     thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/renderwork.png" },
  { title: "RevOps Automation",  thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/cremedigital.png" },
  { title: "Hot Lead Alerts",    thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png" },
  { title: "CRM Ready Export",   thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/invoker.png" },
  { title: "GTM Suite",          thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/efreeinvoice.png" },
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
