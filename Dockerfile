# Use Node.js LTS as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package.json and package-lock.json
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install --production

# Copy the rest of the project
COPY . .

# Expose port 
EXPOSE 5000

# Start the app
CMD ["node", "backend/app.js"]
