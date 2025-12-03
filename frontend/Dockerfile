FROM node:20-alpine

WORKDIR /app

# Set environment variables for React
ENV PORT=3001
ENV HOST=0.0.0.0

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3001

# Start the development server
CMD ["npm", "start"]

