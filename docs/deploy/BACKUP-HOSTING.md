# Backup hosting for the ANCHOR server

`PROPOSED` (26 Sep, assistant for Mutarisi). A second place to run the server if Azure is down or blocked. It is **not** the team's official server: it has its **own signing key and its own database**, so records made on it are separate from Azure's. Tell the team before members use it. Simulation subjects only (`VUKA_SIM_ONLY=1` is forced).

Everything runs from the same container (`Dockerfile`): the API plus the outbox workers that deliver guardian alerts, bank signals and anchor batches.

## Which option

| Option | Always on? | Use it for |
|---|---|---|
| **A. Oracle Cloud Always Free VM + `docker compose`** | Yes | The real backup. Escalation (no answer → guardian alert after ~90 s) needs a server that never sleeps. |
| **B. Render (free web service) + Neon (free PostgreSQL)** | No: sleeps after ~15 min idle, ~30–60 s to wake | Quick demos. An active journey's 30 s heartbeats keep it awake; a first signal after a quiet spell may be late. |

Free tiers change often: check each provider's current terms when you sign up. `ASSUMPTION`

## 0. Make this server's keys (once, on your computer)

```bash
python scripts/make-backup-keys.py --print
```

This writes `.env.backup` (gitignored) with a payload encryption key, **this server's own Ed25519 signing key**, the manifest that pins it, and a database password. `--print` also shows the values to paste into a hosting dashboard. Never commit `.env.backup` or paste it into chat. Keep a private copy: losing the payload key makes stored payloads unreadable.

Then fill in email (and optionally SMS) in `.env.backup`, see step 3.

## A. Oracle Cloud Always Free VM (recommended)

1. Sign up at cloud.oracle.com (Always Free). Create a VM: *Ubuntu 22.04/24.04*, shape *VM.Standard.A1.Flex* (Arm, e.g. 1 OCPU / 6 GB) or *E2.1.Micro*. Download the SSH key it offers.
2. In the VM's subnet **security list**, add ingress rules for TCP **80** and **443** from `0.0.0.0/0`. (Ubuntu's own firewall on Oracle images also blocks them: `sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT && sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT && sudo netfilter-persistent save`.)
3. On the VM:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker $USER && newgrp docker
   git clone https://github.com/LethaboMH14/V.U.KA--Geekulcha.git && cd V.U.KA--Geekulcha
   git checkout feature/integrate
   ```
4. Copy your `.env.backup` to the VM (from your computer): `scp -i key.pem .env.backup ubuntu@<VM-IP>:~/V.U.KA--Geekulcha/`
5. Start it: `docker compose --env-file .env.backup up -d --build` then `curl http://localhost:8000/healthz` → `{"status":"ok","database":"reachable"}`.
6. **HTTPS** (the app only talks HTTPS to a real server). Free hostname: `<VM-IP-with-dashes>.sslip.io` works without buying a domain. Run Caddy in front:
   ```bash
   sudo apt-get install -y caddy
   echo '<VM-IP-with-dashes>.sslip.io { reverse_proxy localhost:8000 }' | sudo tee /etc/caddy/Caddyfile
   sudo systemctl restart caddy
   ```
   Then `https://<VM-IP-with-dashes>.sslip.io/healthz` answers from anywhere. Caddy gets and renews the certificate itself.
7. Updates later: `git pull && docker compose --env-file .env.backup up -d --build`.

## B. Render + Neon (quick demo)

1. **Neon** (neon.tech): create a project, database `vuka`. Copy the connection string (it ends in `?sslmode=require`).
2. **Render** (render.com): *New → Blueprint*, pick this GitHub repo and branch `feature/integrate`; Render reads `render.yaml`.
3. In the service's *Environment*, paste: `DATABASE_URL` (Neon), and from `make-backup-keys.py --print`: `VUKA_PAYLOAD_KEY_B64`, `VUKA_SERVER_ED25519_KEY_B64`, `VUKA_BACKUP_MANIFEST_JSON`; plus `VUKA_BREVO_API_KEY` and `VUKA_EMAIL_FROM` (step 3). Render's free tier blocks outgoing SMTP, so email must go through Brevo's HTTPS API there.
4. Deploy. Check `https://<service>.onrender.com/healthz`.

## 3. Email and SMS codes

Without a provider the server answers `503 delivery_unavailable` and the app says so. (`VUKA_DEV_OTP_LOG=1` prints codes in the server log: only for a private test server.)

- **Email via Brevo (works on every host, required on Render free):** sign up at brevo.com (free, ~300 emails/day `ASSUMPTION`: check current terms). *Senders, Domains & Dedicated IPs → Senders → Add a sender* with an address you own (e.g. your Gmail) and click the link Brevo emails you. Then *SMTP & API → API Keys → Generate a new API key*. Settings: `VUKA_BREVO_API_KEY=<the key>`, `VUKA_EMAIL_FROM=VUKA <the verified sender address>`. Brevo is tried first when its key is set.
- **Email via SMTP (the VM, where SMTP isn't blocked):** a Gmail account with 2-step verification → *App passwords* → create one. Settings: `VUKA_SMTP_HOST=smtp.gmail.com`, `VUKA_SMTP_PORT=587`, `VUKA_SMTP_USER=<the gmail address>`, `VUKA_SMTP_PASSWORD=<app password>`, `VUKA_SMTP_FROM=VUKA <the gmail address>`.
- **SMS (optional):** a Twilio trial account sends to numbers you verify in Twilio. `VUKA_TWILIO_ACCOUNT_SID`, `VUKA_TWILIO_AUTH_TOKEN`, `VUKA_TWILIO_FROM`. Real use costs per message.

Restart after changing settings (`docker compose … up -d`, or Render redeploys).

## 4. Point the app at it

In the app: **Settings → VUKA server → Backup server**, enter `https://…` once. The phone registers again on that server (its own database). **Test connection** should say "Connected". Home shows "● Connected to VUKA's server".

## Try it on your own computer first

With Docker Desktop running:

```bash
python scripts/make-backup-keys.py            # if .env.backup doesn't exist yet
VUKA_PORT=8100 docker compose --env-file .env.backup up -d --build
curl http://127.0.0.1:8100/healthz
adb reverse tcp:8100 tcp:8100                  # then Custom address http://localhost:8100 in the app
docker compose --env-file .env.backup down     # stop (data kept in the pgdata volume)
```

If Docker Hub refuses to pull (`unauthorized: incorrect username or password`, a stale saved login), either `docker logout` or use the public mirror: `POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine PYTHON_IMAGE=public.ecr.aws/docker/library/python:3.13-slim`.

## Not included

Hedera anchoring submission (needs the Node sidecar and the team's Hedera keys: batches stay `pending`), the simulated bank (`bank_signal` stays pending unless `sim_bank` runs), FCM push (needs a Firebase project: `FCM_PROJECT_ID`, `FCM_ACCESS_TOKEN`).
