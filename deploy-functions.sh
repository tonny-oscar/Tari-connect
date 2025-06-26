#!/bin/bash

# Install dependencies
cd functions
npm install

# Deploy functions
npm run deploy

echo "Firebase functions deployed successfully!"