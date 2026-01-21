#!/bin/bash

pnpm -r --filter="./packages/*" exec pnpm publish --access public --no-git-checks
