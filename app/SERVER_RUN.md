# How to Run the Server

1. Build the server:

    cd app/server
    npm run build

2. Start the server (from the app directory):

    cd ../../app
    node dist/server/index.js

This ensures Node.js can find dependencies in app/server/node_modules.

Alternatively, you can create a script in the app directory for convenience.
