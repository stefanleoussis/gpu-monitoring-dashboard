'use client';
import { useEffect, useState } from 'react';
import Metrics from './Metrics';
import { GPUMetric, WorkloadStatus } from '@/lib/types';
import { getCurrentMetric, getWorkloadStatus } from '@/lib/api';

interface Props {
    initialMetric: GPUMetric;
    initialWorkloadStatus: WorkloadStatus;
}

export default function Client({ initialMetric, initialWorkloadStatus }: Props) {
    const [metric, setMetric] = useState<GPUMetric>(initialMetric);
    const [workloadStatus, setWorkloadStatus] = useState<WorkloadStatus>(initialWorkloadStatus);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [metricData, workloadData] = await Promise.all([
                    getCurrentMetric(),
                    getWorkloadStatus(),
                ]);
                setMetric(metricData);
                setWorkloadStatus(workloadData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return <Metrics initialWorkloadStatus={workloadStatus} metric={metric} />;
}
