'use client';

import { AreaChart } from './AreaChart';
import { ChartTooltip } from './ChartTooltip';
import { GPUMetric } from '@/lib/types';
import { DonutChart } from './DonutChart';

interface MemoryDonutChartProps {
    metric: GPUMetric;
}

export function MemoryDonutChart({ metric }: MemoryDonutChartProps) {
    const data = [
        { name: 'Used', value: metric.memory_used },
        { name: 'Free', value: metric.memory_total - metric.memory_used },
    ];

    return (
        <div className='mb-8a'>
            <DonutChart
                className='h-40 w-40'
                data={data}
                value='value'
                category='name'
                // variant='pie'
                label='VRAM'
                showLabel={true}
                colors={['blue', 'pink']}
                valueFormatter={value => `${(value / 1024).toFixed(1)} GB`}
            />

            <div className='mt-4 text-center' />
            <p className='text-sm text-gray-400'>
                {(metric.memory_used / 1024).toFixed(1)} GB /
                {(metric.memory_total / 1024).toFixed(0)} GB
            </p>
        </div>
    );
}
