#!/bin/bash

pnpm -r --filter="./packages/npm/publish" exec pnpm publish --access public --no-git-checks
