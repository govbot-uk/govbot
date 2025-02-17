FROM node:22.11.0-alpine

WORKDIR /app

# Install required packages and doppler
RUN apk add --no-cache curl gnupg && \
    curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Start the bot
CMD ["doppler", "run", "--", "npm", "start"]