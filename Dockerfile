FROM node:18-alpine

WORKDIR /app

# Copy and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application code
COPY backend/ ./backend/
COPY public/ ./public/

EXPOSE 5000

CMD ["node", "backend/app.js"]
