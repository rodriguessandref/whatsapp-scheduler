# Stage 1: Build the React frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm run build

# Stage 2: Setup the Node.js backend
FROM node:18-alpine
WORKDIR /app

# Install WhatsApp dependencies
RUN apk add --no-cache udev ttf-freefont chromium

COPY --from=build /app/dist /app/dist
COPY backend/package.json backend/server.js backend/

WORKDIR /app/backend
RUN npm install

EXPOSE 3001
CMD ["node", "server.js"]
