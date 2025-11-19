import Image from 'next/image';
import TWLogo from '../public/tensorwave-logo.png';
import { getCurrentMetric, getWorkloadStatus } from '@/lib/api';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs';

import Client from '@/components/dashboard/Client';

const metric = {
  _id: '1234',
  timestamp: '2025-11-17T23:54:01.576983+00:00',
  gpu_id: '0',
  gpu_type: 'NVIDIA',
  model: 'NVIDIA GeForce RTX 4090',
  utilization: 6,
  memory_used: 2,
  memory_total: 24564,
  temperature: 41,
  power_draw: 32.29,
};

export default async function Dashboard() {
  const initialMetric = await getCurrentMetric();
  const initialWorkloadStatus = await getWorkloadStatus();

  return (
    <div className='dark flex min-h-screen flex-col bg-black px-18 py-14 text-white'>
      <div className='flex w-full items-center justify-between'>
        <div className='text-4xl font-bold'>GPU Monitoring Dashboard</div>
        <Image
          src={TWLogo}
          alt='TensorWave Logo'
          width={60}
          height={60}
          className='rounded-full border p-3'
        />
      </div>
      <Tabs className='mt-5 w-full justify-start'>
        <TabsList>
          <TabsTrigger value='account'>Nvidia</TabsTrigger>
          <TabsTrigger value='password' className='text-cyan-300 focus:text-cyan-300'>
            AMD
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Client initialWorkloadStatus={initialWorkloadStatus} initialMetric={initialMetric} />
    </div>
  );
}
