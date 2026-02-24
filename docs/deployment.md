# Deployment

Deploy the frontend to a server via SSH using GitHub Actions and Docker.

## Prerequisites

- Docker installed on the server
- Git repo cloned at the deploy path
- `.env` file configured on the server

## GitHub Actions Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Example | Description |
|--------|---------|-------------|
| `SSH_HOST` | `192.168.1.100` or `pelonis` | Server hostname or IP |
| `SSH_USER` | `pelonis` | SSH username |
| `SSH_KEY` | *(see below)* | Private SSH key (full PEM content) |
| `SSH_PORT` | `22` | SSH port (defaults to 22) |
| `DEPLOY_PATH` | `/home/pelonis/files-converter` | Absolute path to the project on the server |

### SSH_KEY

Paste the **entire private key** including headers:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA...
...
-----END OPENSSH PRIVATE KEY-----
```

To generate a deploy key:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/deploy_key

# Copy the public key to the server
ssh-copy-id -i ~/.ssh/deploy_key.pub pelonis@pelonis

# Copy the private key content — paste this into GitHub Secrets as SSH_KEY
cat ~/.ssh/deploy_key
```

## Server Setup (One-Time)

```bash
# SSH into the server
ssh pelonis@pelonis

# Clone the repo
git clone https://github.com/1devspace/files-converter.git /home/pelonis/files-converter
cd /home/pelonis/files-converter

# Create the .env file
cat > .env << 'EOF'
NEXT_PUBLIC_BACKEND_URL=https://api.converter.pelonis.seneca.center
NEXT_PUBLIC_SITE_URL=https://converter.pelonis.seneca.center
EOF

# Build with env vars baked in
set -a && source .env && set +a
docker build \
  --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  -t files-converter .

# Start the container
docker run -d \
  --name files-converter \
  --restart unless-stopped \
  -p 4000:4000 \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=5 \
  files-converter
```

## Workflow

Three GitHub Actions workflows handle CI, release, and deployment:

### 1. CI (`ci.yml`)

- **Trigger**: Push or PR to `main`
- **Steps**: Installs deps, runs lint, type-check, and build

### 2. Release (`release.yml`)

- **Trigger**: Push to `main` or manual dispatch
- **Steps**: Extracts version from `package.json`, generates a changelog from conventional commits, creates a GitHub Release with tag

### 3. Deploy (`deploy.yml`)

- **Trigger**: New release published or manual dispatch
- **Steps**: SSHs into the server, pulls latest code, builds Docker image, restarts container

### Deploy Flow

```
bun run release  →  push tag  →  Release workflow  →  GitHub Release  →  Deploy workflow  →  SSH + Docker
```

## Docker Container

The deploy workflow runs the following on the server:

```bash
set -a && source .env && set +a
docker build \
  --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  -t files-converter .
docker stop files-converter 2>/dev/null || true
docker rm files-converter 2>/dev/null || true
docker run -d \
  --name files-converter \
  --restart unless-stopped \
  -p 4000:4000 \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=5 \
  files-converter
```

## Port Mapping

| Service | Port |
|---------|------|
| Frontend (Next.js) | 4000 |
| API (backend) | 4001 |

## Domain

| URL | Service |
|-----|---------|
| `converter.pelonis.seneca.center` | Frontend |
| `api.converter.pelonis.seneca.center` | Backend API |

## Docker Commands

```bash
# Check status
docker ps | grep files-converter

# View logs
docker logs files-converter

# Follow logs
docker logs -f files-converter

# Restart
docker restart files-converter

# Stop
docker stop files-converter
```

## Updating Environment Variables

Edit the `.env` file on the server and restart the container:

```bash
ssh pelonis@pelonis
nano /home/pelonis/files-converter/.env
docker restart files-converter
```
