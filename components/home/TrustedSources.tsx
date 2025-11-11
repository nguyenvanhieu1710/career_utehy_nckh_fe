"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionTitle from "@/components/common/SectionTitle";

const partners = [
  {
    name: "Joboko",
    logo: "/partners/joboko.png",
    width: 140,
    height: 50,
  },
  {
    name: "TopCV",
    logo: "/partners/topcv.png",
    width: 120,
    height: 50,
  },
  {
    name: "CareerViet",
    logo: "/partners/careerviet.png",
    width: 180,
    height: 50,
  },
  {
    name: "TopDev",
    logo: "/partners/topdev.png",
    width: 130,
    height: 50,
  },
  {
    name: "CareerLink",
    logo: "/partners/careerlink.png",
    width: 160,
    height: 60,
  },
];

export default function TrustedSources() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle title="NGUỒN TIN UY TÍN TỪ" />

        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="object-contain"
                priority
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
