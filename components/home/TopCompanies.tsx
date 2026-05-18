'use client';

import { useState, useEffect } from 'react';
import SectionTitle from '@/components/common/SectionTitle';
import CompanyCard from '@/components/common/CompanyCard';
import PaginationArrows from '@/components/common/PaginationArrows';
import { companyAPI } from '@/services/company';
import { getUploadsUrl } from '@/lib/config';

import { Company, CompanyItem } from '@/types/company';

const mockCompanies: CompanyItem[] = [
  {
    logo: '/companies/mb-bank.png',
    name: 'Ngân hàng TMCP Quân đội MB Bank - MB',
    jobsCount: 47,
    website: 'https://mbbank.com.vn',
  },
  {
    logo: '/companies/fpt.jpg',
    name: 'Công ty Cổ phần Viễn thông FPT Telecom - FPT',
    jobsCount: 112,
    website: 'https://fpt.vn',
  },
  {
    logo: '/companies/vus.png',
    name: 'Anh văn Hội Việt Mỹ VUS Miền Bắc',
    jobsCount: 15,
    website: 'https://vus.edu.vn',
  },
];

export default function TopCompanies() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyAPI.getCompanies({ page: 1, row: 3 });
        if (response.data && response.data.length > 0) {
          const formattedCompanies = response.data.map((c: Company) => ({
            logo: c.logo_url ? getUploadsUrl(c.logo_url) : '/default-company.png',
            name: c.name,
            jobsCount: c.jobs_count !== undefined ? c.jobs_count : c.jobs ? c.jobs.length : 0,
            website: c.website || '#',
          }));
          setCompanies(formattedCompanies);
        } else {
          setCompanies(mockCompanies);
        }
      } catch (error) {
        console.error('Failed to fetch top companies:', error);
        setCompanies(mockCompanies);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <section className='py-16 bg-white'>
      <div className='w-full px-7'>
        <div className='flex justify-between items-center'>
          <SectionTitle title='DOANH NGHIỆP HÀNG ĐẦU' />
          <PaginationArrows />
        </div>
        {loading ? (
          <div className='flex justify-center items-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            {companies.map((company) => (
              <CompanyCard key={company.name} {...company} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
