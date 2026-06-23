# Multi-stage build for API Server
FROM node:20 AS api-builder

WORKDIR /app

# Copy entire workspace
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Set CI environment variable for non-interactive builds
ENV CI=true

# Install all dependencies (including dev for build)
RUN pnpm install

# Build API server
RUN cd apps/api-server && pnpm run build

# Production API Server image
FROM node:20 AS api-server

WORKDIR /app

# Copy entire workspace
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Set CI environment variable for non-interactive builds
ENV CI=true

# Install production dependencies only
RUN pnpm install --prod

# Copy built files from builder
RUN cp -r apps/api-server/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.mjs"]

# Web App Builder
FROM node:20 AS web-builder

WORKDIR /app

# Copy entire workspace
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Set CI environment variable for non-interactive builds
ENV CI=true

# Install all dependencies (including dev for build)
RUN pnpm install

# Build web app
RUN cd apps/forge && pnpm run build

# Production Web App image (nginx)
FROM nginx:alpine AS web-app

# Copy built files from builder
COPY --from=web-builder /app/apps/forge/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
