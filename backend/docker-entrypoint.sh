#!/bin/sh

echo "Waiting for MongoDB to be ready..."
sleep 10

echo "Running database seed..."
npm run seed

echo "Starting application..."
npm run dev