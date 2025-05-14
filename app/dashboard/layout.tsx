"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/services/api.service';
import DashboardLayout from '@/components/dashboard-layout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("Authenticating with default admin credentials...");
          const loginResponse = await loginAdmin('admin@us50transport.com', 'admin123');
          
          if (!loginResponse.success) {
            console.error("Auto-login failed, redirecting to login page");
            router.push('/login');
            return;
          }
        }
        
        // Successfully authenticated
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Show dashboard layout once authenticated
  return <DashboardLayout>{children}</DashboardLayout>;
}
