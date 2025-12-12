# CS554_FinalProject
This is final project for CS554.

## Port Configuration

This project uses Docker Compose with configurable ports. If you have local services running on the default ports, you can override them by creating a `.env` file in the root directory.

### Default Ports:
- **MongoDB**: 27017
- **Redis**: 6379
- **MinIO API**: 9000
- **MinIO Console**: 9001
- **Backend API**: 3000
- **Frontend**: 3001

### Customizing Ports:

Create a `.env` file in the root directory with your custom ports:

```env
MONGODB_PORT=27018
REDIS_PORT=6380
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003
BACKEND_PORT=3002
FRONTEND_PORT=3003
CORS_ORIGIN=http://localhost:3003
REACT_APP_API_URL=http://localhost:3002/api
```

**Note**: If you change `BACKEND_PORT` or `FRONTEND_PORT`, make sure to also update `CORS_ORIGIN` and `REACT_APP_API_URL` accordingly.
