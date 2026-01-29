# Deployment Guide

This guide will help you deploy the Resumr application to your server using GitHub Actions, Docker, and Nginx.


### Create deployment directory

```bash
sudo mkdir -p /opt/stacks/resumr
sudo chown $USER:$USER /opt/stacks/resumr
```

## 2. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SSH_HOST` | Your server IP address | `` |
| `SSH_USERNAME` | SSH username | `` |
| `SSH_PRIVATE_KEY` | Your SSH private key content | (contents of ``) |
| `DATABASE_URL` | PostgreSQL connection string to your existing database | `` |
| `AUTH_URL` | Application URL | `` |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -hex 32`) | `` |
| `N8N_API_KEY` | N8N API key | `` |