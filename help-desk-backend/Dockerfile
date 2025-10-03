# Use official Node.js LTS image as the base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the application port (change if your app uses a different port)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]