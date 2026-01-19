import os
import platform
import subprocess

port = 5001

try:
    port_int = int(port)
except (TypeError, ValueError):
    raise ValueError("Port must be an integer")
port_str = str(port_int)

if platform.system() == "Windows":
    # Run netstat without using the shell, then filter for the desired port in Python.
    netstat_output = subprocess.check_output(['netstat', '-ano']).decode()
    lines_for_port = [
        line for line in netstat_output.splitlines()
        if f":{port_str}" in line
    ]
    pids = set(line.split()[-1] for line in lines_for_port if line.strip())
    for pid in pids:
        os.system(f"taskkill /PID {pid} /F")
else:
    # Call lsof with arguments as a list to avoid using the shell.
    result = subprocess.check_output(['lsof', '-ti', f':{port_str}']).decode().split()
    for pid in result:
        os.system(f"kill -9 {pid}")
