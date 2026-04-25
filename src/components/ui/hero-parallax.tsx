"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MagicButton, MagicLink } from "@/components/ui/MagicButton";

const TypewriterSound = dynamic(
  () => import("@/components/TypewriterSound"),
  { ssr: false }
);

export type Product = {
  title: string;
  thumbnail: string;
};

export function HeroParallax({ products }: { products: Product[] }) {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-x-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <HeroHeader />
      {/* pointer-events-none stops the 3D-transformed rows (which start at translateY -700
          and visually overlap the hero text) from intercepting clicks on the header area.
          Each ProductCard re-enables pointer-events on itself. */}
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }} className="pointer-events-none">
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              key={product.title}
              product={product}
              translate={translateX}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              key={product.title}
              product={product}
              translate={translateXReverse}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              key={product.title}
              product={product}
              translate={translateX}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function HeroHeader() {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-7xl font-bold text-[#1A1A2E] leading-tight"
        style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}
      >
        Turn Cold Leads Into
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        <TypewriterSound />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
        className="max-w-2xl text-base md:text-xl mt-8 text-[#374151] leading-relaxed"
      >
        Elise Lens enriches inbound leads with real market data, scores them
        automatically, and drafts personalized AI-powered outreach — built
        for modern sales teams.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-4 mt-10"
      >
        <MagicLink href="/dashboard">
          Launch Dashboard →
        </MagicLink>
        <MagicButton
          variant="ghost"
          onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
        >
          See How It Works ↓
        </MagicButton>
      </motion.div>
    </div>
  );
}

function ProductCard({
  product,
  translate,
}: {
  product: Product;
  translate: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className="group/product h-96 w-[30rem] relative flex-shrink-0 pointer-events-auto"
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <Image
          src={product.thumbnail}
          height={600}
          width={600}
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </div>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none rounded-2xl transition-opacity duration-300" />
      <h2 className="absolute bottom-4 left-4 pointer-events-none opacity-0 group-hover/product:opacity-100 text-white font-semibold text-lg transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  );
}
