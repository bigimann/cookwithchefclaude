# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Set default port to 8080 for Fly.io
ENV PORT=8080

# Install required packages
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY --link package.json package-lock.json ./
RUN npm install --production

# Copy application code
COPY --link . .

# Expose the port (optional, for documentation purposes)
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start"]
