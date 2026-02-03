# Docker Build Troubleshooting

## Network Issues During Build

If you encounter network errors during Docker build (connection refused to deb.debian.org):

### Quick Fixes

1. **Retry the build** (often temporary network issues):
   ```bash
   docker build -f Dockerfile.agent -t registry.fly.io/eliza-agent:latest .
   ```

2. **Check Docker Desktop is running**:
   - Ensure Docker Desktop is running on macOS
   - Check Docker Desktop status in menu bar

3. **Restart Docker Desktop**:
   - Quit Docker Desktop completely
   - Restart Docker Desktop
   - Wait for it to fully start

4. **Check network connectivity**:
   ```bash
   ping -c 2 deb.debian.org
   ```

5. **Use Docker build with retries**:
   ```bash
   docker build --network=host -f Dockerfile.agent -t registry.fly.io/eliza-agent:latest .
   ```

### Alternative: Use Existing Dockerfile

The eliza repository has an existing Dockerfile. You could use that instead:

```bash
docker build -f Dockerfile -t registry.fly.io/eliza-agent:latest .
```

Note: The existing Dockerfile uses `bun` instead of `pnpm`, but it should work for deployment.

### If Build Continues to Fail

1. **Check Docker logs**:
   - Open Docker Desktop
   - Check logs for network errors

2. **Try building in smaller steps**:
   - Comment out some package installations temporarily
   - Build in stages to identify the problematic step

3. **Use a VPN/proxy if behind corporate firewall**:
   - Corporate networks sometimes block Docker builds
   - Try from a different network

4. **Check system resources**:
   ```bash
   docker system df
   docker system prune  # Clean up if needed
   ```

### After Successful Build

Once the build succeeds:

1. **Tag the image** (if not already tagged):
   ```bash
   docker tag eliza-agent:latest registry.fly.io/eliza-agent:latest
   ```

2. **Authenticate with Fly.io**:
   ```bash
   fly auth docker
   ```

3. **Push the image**:
   ```bash
   docker push registry.fly.io/eliza-agent:latest
   ```

