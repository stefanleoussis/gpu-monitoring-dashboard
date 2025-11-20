'use client';

import { LineChart } from './LineChart';

import { ChartTooltip } from './ChartTooltip';
import { GPUMetric } from '@/lib/types';

interface UtilLineChartProps {
    data: GPUMetric[];
    timeRange: '1h' | '24h' | '7d';
}

export function UtilLineChart({ data, timeRange }: UtilLineChartProps) {
    const formatXAxis = (timestamp: string) => {
        const date = new Date(timestamp);

        if (timeRange === '1h') {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
        } else if (timeRange === '24h') {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    return (
        <div className='mb-8'>
            <LineChart
                className='h-80 w-full select-none'
                data={data}
                index='timestamp'
                categories={['utilization']}
                colors={['blue']}
                customTooltip={ChartTooltip}
                yAxisWidth={40}
                xAxisFormatter={formatXAxis}
                tickGap={30}
                legendPosition='left'
            />
        </div>
    );
}
