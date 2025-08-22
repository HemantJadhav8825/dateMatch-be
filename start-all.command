#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Define services (including gateway)
services=("gateway" "services/auth-service" "services/call-service" "services/match-service" "services/payment-service" "services/user-service")

# Loop through each service and open a new terminal window
for service in "${services[@]}"; do
  osascript -e "tell app \"Terminal\"
    do script \"cd $(pwd)/$service && npm install && node server.js\"
  end tell"
done
