'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 animate-pulse h-64" />
      ))}
    </div>
  ),
});

export default function ChartsWrapper(props: any) {
  return <DashboardCharts {...props} />;
}
