# Xandeum Pulse Backend

Backend sync service for Xandeum Pulse that fetches pNode data from pRPC endpoints and syncs it to Supabase.

## Architecture

```
┌─────────────────┐
│  pRPC Endpoints │  Multiple pNode endpoints
│   (port 6000)   │  - get-version, get-stats, get-pods
└────────┬────────┘
         │
         │ HTTP/JSON-RPC 2.0
         ▼
┌─────────────────┐
│  Backend Server │  Node.js/Express
│  (Sync Service) │  - Fetches from pRPC every N seconds
└────────┬────────┘  - Processes and transforms data
         │           - Handles failover between endpoints
         │
         │ Supabase Client (Service Key)
         ▼
┌─────────────────┐
│    Supabase     │  PostgreSQL Database
│   (Database)    │  - Stores pNode data
└─────────────────┘  - Stores network statistics
```

## Features

- **Automatic Syncing**: Cron-based scheduler syncs pRPC data to Supabase at configurable intervals
- **Endpoint Failover**: Automatically switches between multiple pRPC endpoints if one fails
- **Health Monitoring**: Health check endpoints for monitoring service status
- **Network Stats**: Calculates and stores aggregated network statistics
- **Error Handling**: Comprehensive error handling with retry logic
- **Logging**: Winston-based logging with file and console transports

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```env
# Backend Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# pRPC Endpoints (comma-separated)
PRPC_ENDPOINTS=http://173.212.203.145:6000/rpc,http://173.212.220.65:6000/rpc

# Sync Configuration
SYNC_INTERVAL_SECONDS=60
API_TIMEOUT_MS=10000
MAX_RETRIES=3

# Logging
LOG_LEVEL=info
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | HTTP server port | `3001` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (not anon key!) | Required |
| `PRPC_ENDPOINTS` | Comma-separated list of pRPC endpoints | Required |
| `SYNC_INTERVAL_SECONDS` | How often to sync data (in seconds) | `60` |
| `API_TIMEOUT_MS` | Request timeout for pRPC calls | `10000` |
| `MAX_RETRIES` | Number of retries for failed requests | `3` |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |

## Usage

### Development Mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly with hot reloading.

### Production Mode

```bash
# Build the project
npm run build

# Start the server
npm start
```

## API Endpoints

### GET /health

Health check endpoint that verifies connectivity to both pRPC endpoints and Supabase.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-17T12:00:00.000Z",
  "sync": {
    "isRunning": true,
    "syncStatus": {
      "lastSync": "2025-12-17T12:00:00.000Z",
      "nextSync": "2025-12-17T12:01:00.000Z",
      "nodesSynced": 42,
      "errors": [],
      "isRunning": false
    },
    "intervalSeconds": 60
  }
}
```

### GET /sync/status

Get the current sync status.

**Response:**
```json
{
  "isRunning": true,
  "syncStatus": {
    "lastSync": "2025-12-17T12:00:00.000Z",
    "nextSync": "2025-12-17T12:01:00.000Z",
    "nodesSynced": 42,
    "errors": [],
    "isRunning": false
  },
  "intervalSeconds": 60
}
```

### POST /sync/trigger

Manually trigger a sync operation (useful for testing).

**Response:**
```json
{
  "message": "Sync triggered",
  "timestamp": "2025-12-17T12:00:00.000Z"
}
```

## How It Works

1. **Scheduler starts** on application boot
2. **Initial sync runs** immediately
3. **Cron job triggers** sync at configured intervals
4. For each sync:
   - Fetches `get-version`, `get-stats`, and `get-pods` from pRPC
   - Transforms pRPC data into normalized pNode format
   - Upserts nodes to `pnodes` table in Supabase
   - Calculates network statistics
   - Records stats to `network_stats` table
5. Frontend reads data from Supabase (no direct pRPC calls)

## Database Schema

The service writes to these Supabase tables:

- **pnodes**: Current state of all pNodes
- **network_stats**: Aggregated network metrics (recorded each sync)
- **pnode_history**: Historical snapshots (via database triggers)

Refer to `/supabase/schema.sql` in the main project for the complete schema.

## Logging

Logs are written to:
- **Console**: Colored, formatted output
- **logs/combined.log**: All logs
- **logs/error.log**: Error logs only

Log levels: `error`, `warn`, `info`, `debug`

## Deployment

### Using Heroku (Recommended)

The backend is currently deployed on Heroku at: [https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/](https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/)

#### Initial Setup

```bash
# Install Heroku CLI if not already installed
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_KEY=your-service-role-key
heroku config:set PRPC_ENDPOINTS=http://endpoint1:6000/rpc,http://endpoint2:6000/rpc
heroku config:set SYNC_INTERVAL_SECONDS=30
heroku config:set API_TIMEOUT_MS=10000
heroku config:set MAX_RETRIES=3
heroku config:set LOG_LEVEL=info

# Initialize git repository (if not already initialized)
git init

# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Files Required for Heroku Deployment

1. **Procfile** (tells Heroku how to run the app):
   ```
   web: node dist/index.js
   ```

2. **package.json** with `heroku-postbuild` script:
   ```json
   {
     "scripts": {
       "heroku-postbuild": "npm run build"
     }
   }
   ```

3. **.slugignore** (optional, excludes files from deployment):
   ```
   *.md
   *.log
   .env.example
   .eslintrc.json
   logs/
   ```

#### Verify Deployment

```bash
# Open the app in browser
heroku open

# Check logs
heroku logs --tail

# Check health endpoint
curl https://your-app-name.herokuapp.com/health

# Check sync status
curl https://your-app-name.herokuapp.com/sync/status
```

#### Updating the Deployed App

```bash
# Make your changes, then:
git add .
git commit -m "Your commit message"
git push heroku main
```

#### Troubleshooting Heroku Deployment

**Build fails with "No inputs were found in config file":**
- Ensure `src/` directory is not in `.slugignore`
- TypeScript needs source files to compile

**App crashes on startup:**
- Check logs: `heroku logs --tail`
- Verify all environment variables are set: `heroku config`
- Ensure `Procfile` points to correct entry point

**Port binding errors:**
- Heroku automatically sets the `PORT` environment variable
- The app uses `process.env.PORT || 3001`

---

### Using PM2 (For VPS Deployment)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start dist/index.js --name xandeum-pulse-backend

# Save the process list
pm2 save

# Set up auto-restart on reboot
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

### Using systemd

Create `/etc/systemd/system/xandeum-pulse-backend.service`:

```ini
[Unit]
Description=Xandeum Pulse Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable xandeum-pulse-backend
sudo systemctl start xandeum-pulse-backend
```

## Monitoring

Monitor the service using:

```bash
# Check health
curl http://localhost:3001/health

# Check sync status
curl http://localhost:3001/sync/status

# View logs
tail -f logs/combined.log
```

## Troubleshooting

### Service won't start

- Check that all required environment variables are set
- Verify Supabase URL and service key are correct
- Ensure at least one pRPC endpoint is accessible

### Sync failing

- Check pRPC endpoint connectivity: `curl http://your-endpoint:6000/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'`
- Verify Supabase service key has write permissions
- Check logs for specific error messages

### No data in Supabase

- Verify sync is running: `GET /sync/status`
- Check that pRPC endpoints are returning data
- Ensure database schema is properly set up

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build only
npm run build
```

## License

MIT

## Author

Built by [0xstarhq](https://x.com/0xstarhq) for the Xandeum Network ecosystem.
