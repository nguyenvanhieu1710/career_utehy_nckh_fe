"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface ViewedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  viewedAt: string;
  logo: string;
  isViewed: boolean;
}

const jobs: ViewedJob[] = [
  {
    id: 1,
    title: "Senior Unity Developer",
    company: "Công ty Cổ phần Funtap",
    location: "Hà Nội, Hải Phòng",
    viewedAt: "12/11/2025 - 9:00",
    logo: "/logo/funtap.png",
    isViewed: true,
  },
  {
    id: 2,
    title: "Intern/Junior/Middle QA/Tester",
    company: "Công ty TNHH AvePoint",
    location: "Hà Nội, Đà Nẵng",
    viewedAt: "10/11/2025 - 14:10",
    logo: "/logo/avepoint.png",
    isViewed: false,
  },
];

export default function ViewedJobs() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-5xl border border-gray-300 rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-10">
          THEO DÕI CÔNG VIỆC ĐÃ XEM
        </h1>

        <div className="grid grid-cols-12 gap-4 mb-4 px-4 font-semibold">
          <div className="col-span-8">VIỆC LÀM</div>
          <div className="col-span-4 text-center">TRẠNG THÁI</div>
        </div>

        <div className="space-y-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="grid grid-cols-12 gap-4 border border-gray-300 rounded-xl p-5 items-center"
            >
              <div className="col-span-8">
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
                      Đã xem: <span className="font-medium">{job.viewedAt}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex justify-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${job.isViewed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {job.isViewed ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {job.isViewed ? 'Đã xem' : 'Chưa xem'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}