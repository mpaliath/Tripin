#!/bin/bash
# link-env.sh: Prompt for .env file location and create a symlink in app/server

set -e

DEFAULT_ENV_PATH="$HOME/.config/tripin/server.env"
TARGET_LINK="$(dirname "$0")/../server/.env"

read -p "Enter the path to your .env file [${DEFAULT_ENV_PATH}]: " ENV_PATH
ENV_PATH=${ENV_PATH:-$DEFAULT_ENV_PATH}

if [ -L "$TARGET_LINK" ] || [ -f "$TARGET_LINK" ]; then
    echo "Removing existing .env at $TARGET_LINK"
    rm -f "$TARGET_LINK"
fi

ln -s "$ENV_PATH" "$TARGET_LINK"
echo "Symlink created: $TARGET_LINK -> $ENV_PATH"
