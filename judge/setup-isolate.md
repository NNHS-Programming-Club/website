# Installing isolate

For Ubuntu with cgroup v2 and systemd (in WSL 2: `systemd=true` under `[boot]` in `/etc/wsl.conf`).

In WSL, install a Linux Node; the Windows one cannot start isolate:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
```

Install isolate v2:

```bash
sudo apt update
sudo apt install -y build-essential pkg-config libcap-dev libsystemd-dev git
git clone https://github.com/ioi/isolate.git
cd isolate
git checkout v2.0
sudo make install
sudo cp systemd/isolate.service systemd/isolate.slice /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now isolate.service
```

Verify:

```bash
isolate --cg --init       # prints the box path
isolate --cg --cleanup
```
