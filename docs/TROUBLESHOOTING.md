# 🔧 Troubleshooting Guide

Common issues and their solutions for Coder Arena.

## Build & Installation Issues

### Error: "Cannot find module"
**Symptoms:** Import errors, module not found

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm run install:all

# Clear npm cache if persists
npm cache clean --force
npm run install:all
```

### Error: TypeScript compilation fails
**Symptoms:** Build errors with `.ts` files

**Solutions:**
```bash
# Check TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install -D typescript@latest

# Clean build
rm -rf dist/
npm run build
```

### Error: "Port already in use"
**Symptoms:** EADDRINUSE error

**Solutions:**
```bash
# Find process using port 3001
lsof -i :3001
# or on Windows
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

## Connection Issues

### WebSocket won't connect
**Symptoms:** "Failed to connect to ws://localhost:3001"

**Check:**
1. Is server running? `ps aux | grep node`
2. Is port open? `telnet localhost 3001`
3. Firewall blocking? Temporarily disable to test
4. CORS settings correct? Check `.env`

**Solutions:**
```bash
# Restart server
pm2 restart coder-arena

# Check server logs
pm2 logs coder-arena

# Verify health endpoint
curl http://localhost:3001/health
```

### "Cannot connect to server"
**Symptoms:** Client shows connection error

**Solutions:**
1. Check server is running: `npm run dev:server`
2. Check client is pointing to correct URL
3. Clear browser cache and localStorage
4. Try different browser
5. Check network tab in DevTools for errors

## Gameplay Issues

### Code editor not loading
**Symptoms:** Blank editor or Monaco won't load

**Solutions:**
```bash
# Clear browser cache
# In Chrome: Ctrl+Shift+Del

# Check client build
cd client
npm run build
```

**Browser Console Error?**
- Check for CORS errors
- Try incognito mode
- Update browser to latest version

### Battle doesn't start
**Symptoms:** Stuck on "Waiting for battle..."

**Check:**
1. Did both players click "Ready"?
2. Check server logs for errors
3. Try refreshing page
4. Create new match

### Code validation fails
**Symptoms:** "Invalid CASL code" error

**Common Mistakes:**
```casl
# ❌ Wrong: Missing END
IF distance < 50 THEN
  ATTACK

# ✅ Correct:
IF distance < 50 THEN
  ATTACK
END

# ❌ Wrong: Invalid variable
IF my_hp < 30 THEN  # Should be my_health

# ✅ Correct:
IF my_health < 30 THEN
  BLOCK
END
```

### Match results not showing
**Symptoms:** Redirected to lobby after battle

**Solutions:**
```bash
# Check browser console for errors
# Clear localStorage
localStorage.clear()

# Check server logs
pm2 logs coder-arena
```

## Performance Issues

### High CPU usage
**Symptoms:** Server using 100% CPU

**Causes & Solutions:**
1. **Infinite loops in player code** - Add execution limits
2. **Too many simultaneous matches** - Scale horizontally
3. **Memory leak** - Restart server, check for leaks

**Monitor:**
```bash
# Watch resources
top -p $(pgrep -f "node.*coder-arena")

# PM2 monitoring
pm2 monit
```

### Laggy battle animations
**Symptoms:** Choppy fighter movement

**Solutions:**
1. Close other browser tabs
2. Disable browser extensions
3. Update graphics drivers
4. Reduce animation quality in settings
5. Use Chrome or Firefox (best performance)

### Memory leaks
**Symptoms:** Increasing RAM usage over time

**Solutions:**
```bash
# Restart server
pm2 restart coder-arena

# Enable memory monitoring
pm2 start app.js --max-memory-restart 500M
```

## Docker Issues

### Container won't start
**Symptoms:** Docker compose fails

**Solutions:**
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs -f

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Volume permission errors
**Symptoms:** EACCES errors in Docker

**Solutions:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker-compose up -d
```

## Database Issues (Future)

Currently using in-memory storage, but when database is added:

### Connection refused
```bash
# Check database is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Restart database
docker-compose restart db
```

## Browser Issues

### Stats not persisting
**Symptoms:** Stats reset after refresh

**Cause:** localStorage issues

**Solutions:**
```javascript
// Check in browser console
localStorage.getItem('coder-arena-stats')

// Clear and try again
localStorage.clear()
```

### Can't log in
**Symptoms:** Login button doesn't work

**Solutions:**
1. Check server is running
2. Open DevTools > Network tab
3. Look for failed requests
4. Check CORS errors
5. Try different username

### UI looks broken
**Symptoms:** Missing styles, broken layout

**Solutions:**
```bash
# Rebuild client
cd client
npm run build

# Clear cache
# In Chrome: Ctrl+Shift+R (hard refresh)
```

## Common Error Messages

### "Token validation failed"
**Cause:** JWT token expired or invalid

**Solution:** Logout and login again

### "Match not found"
**Cause:** Match was cancelled or expired

**Solution:** Return to lobby and queue again

### "Code execution timeout"
**Cause:** Code took too long to execute

**Solution:** Optimize your code, avoid complex loops

### "WebSocket disconnected"
**Cause:** Network interruption or server restart

**Solution:**
1. Page will auto-reconnect
2. If not, refresh page
3. Check internet connection

## Getting Help

If your issue isn't listed here:

1. **Check server logs:**
   ```bash
   pm2 logs coder-arena --lines 50
   ```

2. **Check browser console:**
   - Press F12
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Enable debug mode:**
   ```bash
   LOG_LEVEL=debug npm start
   ```

4. **Report a bug:**
   - Go to GitHub Issues
   - Include error message
   - Include steps to reproduce
   - Include system info (OS, browser, Node version)

5. **Community support:**
   - Discord server (coming soon)
   - GitHub Discussions
   - Stack Overflow (tag: coder-arena)

## Debug Checklist

When something breaks:
- [ ] Check server is running
- [ ] Check browser console for errors
- [ ] Check server logs
- [ ] Try different browser
- [ ] Clear cache and localStorage
- [ ] Restart server
- [ ] Check .env configuration
- [ ] Verify all dependencies installed
- [ ] Check network connectivity
- [ ] Try the simplest possible scenario

## Still Stuck?

Open a GitHub Issue with:
- **Environment:** OS, Node version, browser
- **Error message:** Full text of error
- **Steps to reproduce:** What you did before error
- **Expected vs Actual:** What should happen vs what happened
- **Logs:** Relevant server/client logs

We'll help you out! 🆘

---

**Most issues are solved by restarting the server or clearing browser cache.** 🔄
