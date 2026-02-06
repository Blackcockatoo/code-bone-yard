#!/bin/bash
# Install ts-node if not present
if ! command -v ts-node &> /dev/null
then
    pnpm add -g ts-node typescript
fi

# Run the test
NODE_OPTIONS="--loader ts-node/esm" ts-node /home/ubuntu/steve-project/meta-pet-core/tests/dreamSystem.test.ts
