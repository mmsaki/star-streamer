# node template

1. Test streaming with 'node:fs'

   ```zsh
   pnpm run stream:base
   ```

1. Create helia stream

   ```zsh
   pnpm run stream:helia
   ```

1. Streaming with known cid

   ```zsh
   pnpm run stream:cid QmPvt66qGviw7T6r6Qe2Lhpgj6YCpexv8gz7SKXEHq4FD3
   ```

## Testing

Run

```zsh
pnpm test
```

## Streaming with hypercore

1. Convert video into a core

   ```zsh
   pnpm run hypercore:convert
   ```

1. Replicate so other peers can also watch it

   ```zsh
   pnpm run hypercore
   ```

1. Other peers can join with the core key

   ```zsh
   pnpm run hypercore:peer ec429308a714b51a79b583627cc705e6eaf5f6f681a3b7158138ca315dbaea46
   ```

   <img width="1206" alt="screenshot" src="https://github.com/mmsaki/star-streamer/assets/98189596/45472ce2-c5c5-464e-8143-f85e36ecd5cb">
