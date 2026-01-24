#!/bin/bash

pnpm -r --filter="./packages/create-chaos" exec pnpm publish --access public --no-git-checks
