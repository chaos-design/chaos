import Footer from "@docs/components/landing/footer";
import { Hero } from "@docs/components/landing/hero";
import { Features } from "../../components/landing/features";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      {/* <ComponentsSlideshow /> */}
      {/* <BlockCategories /> */}
      <Footer />
    </>
  );
}

