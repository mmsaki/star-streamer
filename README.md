# node template

1. Test streaming with 'node:fs'

   ```zsh
   pnpm run basic-stream
   ```

1. Create helia stream

   ```zsh
   pnpm run helia-stream
   ```

1. Streaming with known cid

   ```zsh
   pnpm run external-stream QmPvt66qGviw7T6r6Qe2Lhpgj6YCpexv8gz7SKXEHq4FD3
   ```

## Testing

Run

```zsh
pnpm test
```

## Streaming with hypercore

1. Convert video into a core

   ```zsh
   pnpm run hypercore-convert
   ```

1. Replicate so other peers can also watch it

   ```zsh
   pnpm run hypercore-replicate
   ```

1. Other peers can join with the core key

   ```zsh
   pnpm run hypercore-peer ec429308a714b51a79b583627cc705e6eaf5f6f681a3b7158138ca315dbaea46
   ```
