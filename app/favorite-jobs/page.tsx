"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface FavoriteJob {
  id: number;
  title: string;
  company: string;
  location: string;
  savedAt: string;
  logo: string;
}

const jobs: FavoriteJob[] = [
  {
    id: 1,
    title: "Senior Unity Developer",
    company: "Công ty Cổ phần Funtap",
    location: "Hà Nội, Hải Phòng",
    savedAt: "12/11/2025 - 9:00",
    logo: "/logo/funtap.png",
  },
  {
    id: 2,
    title: "Intern/Junior/Middle QA/Tester",
    company: "Công ty TNHH AvePoint",
    location: "Hà Nội, Đà Nẵng",
    savedAt: "10/11/2025 - 14:10",
    logo: "/logo/avepoint.png",
  },
];

export default function FavoriteJobsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-3xl border border-gray-300 rounded-2xl p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-center text-green-700 mb-10">
          Danh sách việc làm yêu thích
        </h1>

        <div className="space-y-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="border border-gray-300 rounded-xl p-5 relative"
            >
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-red-700">
                    {job.title}
                  </h2>

                  <p className="text-gray-700">{job.company}</p>

                  <p className="text-gray-500 text-sm">{job.location}</p>

                  <p className="text-gray-600 text-sm mt-2">
                    Đã lưu: <span className="font-medium">{job.savedAt}</span>
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4">
                <button
                  className="border border-gray-400 rounded-xl p-2 hover:bg-gray-100 transition"
                >
                  <Trash2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
