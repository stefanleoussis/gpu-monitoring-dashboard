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
    import requests

    GO_SERVICE_URL = "http://localhost:8080/metrics/ingest"

    print('Starting GPU metrics collector...')
    print('Metrics will be collected every 5 seconds. Please Press Ctrl+C to stop. \n')

    try:
        while True:
            metrics = get_gpu_metrics()

            try:
                response = requests.post(
                    GO_SERVICE_URL, json=metrics, timeout=2)
                if response.status_code == 202:
                    print(
                        f"Sent: GPU {metrics['gpu_id']}, Util: {metrics['utilization']}%, Temp: {metrics['temperature']}C")
                else:
                    print(f"Error: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Failed to send metrics: {e}")

            time.sleep(60)

    except KeyboardInterrupt:
        print('\nStopped.')
