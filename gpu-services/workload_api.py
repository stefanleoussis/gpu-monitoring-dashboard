from flask import Flask, jsonify
import subprocess
import signal
import os

app = Flask(__name__)
current_process = None

@app.route('/workload/start', methods=['POST'])
def start_workload():
    global current_process
    
    if current_process and current_process.poll() is None:
        return jsonify({"error": "Workload is already running"}), 400
    
    current_process = subprocess.Popen(
        ['python3', 'workload_tensorflow.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    return jsonify({
        "status": "started",
        "pid": current_process.pid
    })

@app.route('/workload/stop', methods=['POST'])
def stop_workload():
    global current_process
    
    if not current_process or current_process.poll() is not None:
        return jsonify({"error": "No workload running"}), 400
    
    current_process.send_signal(signal.SIGTERM)
    current_process.wait(timeout=5)
    
    return jsonify({"status": "stopped"})

@app.route('/workload/status', methods=['GET'])
def get_status():
    global current_process
    
    if not current_process:
        status = "never_started"
    elif current_process.poll() is None:
        status = "running"
    else:
        status = "stopped"
    
    return jsonify({
        "status": status,
        "pid": current_process.pid if current_process else None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)