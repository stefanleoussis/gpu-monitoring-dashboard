import subprocess
import json
import time
from datetime import datetime, timezone


def get_gpu_metrics():

    result = subprocess.run([
        'nvidia-smi',
        '--query-gpu=index,name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw',
        '--format=csv,noheader,nounits'
    ], capture_output=True, text=True, check=True)

    data = result.stdout.strip().split(',')

    metrics = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gpu_id": data[0].strip(),
        "gpu_type": "NVIDIA",
        "model": data[1].strip(),
        "utilization": int(data[2].strip()),
        "memory_used": int(data[3].strip()),
        "memory_total": int(data[4].strip()),
        "temperature": int(data[5].strip()),
        "power_draw": float(data[6].strip())
    }

    return metrics


if __name__ == "__main__":
    print('Starting GPU metrics collector...')
    print('Metrics will be collected every 5 seconds. Please Press Ctrl+C to stop. \n')

    try:
        while True:
            metrics = get_gpu_metrics()
            print(json.dumps(metrics, indent=2))
            print("-" * 50)
            time.sleep(5)
    except KeyboardInterrupt:
        print('\nStopped.')
