#!/bin/bash
# this should probably not be here but I'm sick and tired of this breaking my servers so here
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

cd "$(dirname "$0")"
npm run start
