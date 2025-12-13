# How to Restart the DFO API

## Quick Restart

```bash
# Stop the current server
lsof -ti:3030 | xargs kill -9

# Start the server with the new fixes
cd /Users/carlosjperez/Documents/GitHub/solaria-digital-field--operations/dashboard
PORT=3030 node server.js
```

## Using PM2 (Recommended for Production)

```bash
# If not already using PM2, install it
npm install -g pm2

# Start with PM2
cd /Users/carlosjperez/Documents/GitHub/solaria-digital-field--operations/dashboard
pm2 start server.js --name dfo-api -- --port 3030

# Or restart if already running
pm2 restart dfo-api

# View logs
pm2 logs dfo-api

# Check status
pm2 status
```

## Using npm scripts

```bash
cd /Users/carlosjperez/Documents/GitHub/solaria-digital-field--operations/dashboard
npm start
```

## Verify the server is running

```bash
# Check health endpoint
curl http://localhost:3030/api/health

# Should return:
# {"status":"healthy","timestamp":"...","database":"connected","connected_clients":0,"uptime":...}
```

## Test the bug fixes

```bash
# Run the test script
node test-api-fixes.js
```

## Environment Variables

Make sure `.env` is configured:

```bash
PORT=3030
DB_HOST=localhost
DB_USER=solaria_user
DB_PASSWORD=solaria2024
DB_NAME=solaria_construction
JWT_SECRET=bd444a11ea9ff8fab937a632c828a7ff387492f1d559662645bf1803f3376245
```

## Troubleshooting

### Port already in use
```bash
# Find and kill the process
lsof -ti:3030 | xargs kill -9
```

### Database connection issues
```bash
# Check MySQL is running
mysql -u solaria_user -psolaria2024 -e "SELECT 1;"

# Or with Docker
docker ps | grep mysql
```

### Check logs
```bash
# If running with PM2
pm2 logs dfo-api

# If running in background
tail -f /tmp/dfo-server.log
```

---

**Note:** After restart, all existing sessions will be invalidated. Users will need to log in again.
