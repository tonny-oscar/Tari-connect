#!/bin/bash

# Set environment variables for the emulator
export FUNCTIONS_EMULATOR=true

# Start the Firebase emulators
cd functions
npm run serve