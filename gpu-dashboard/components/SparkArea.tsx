'use client';

import { AreaChart } from './AreaChart';
import { ChartTooltip } from './ChartTooltip';
import { GPUMetric } from '@/lib/types';

interface SparkAreaProps {
    data: GPUMetric[];
    dataKey: 'utilization' | 'temperature' | 'power_draw';
    color?: string;
}

export function TempAreaChart({ data, dataKey, color = '#22D3EE' }: SparkAreaProps) {
    const sparkAreaData = data.slice(-20);

    return (
        <div className='mb-8'>
            <AreaChart
                className='h-80 w-full select-none'
                data={data}
                index='timestamp'
                categories={['temperature']}
                colors={['pink']}
                customTooltip={ChartTooltip}
                yAxisWidth={40}
            />
        </div>
    );
}
