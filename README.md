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

## Adding movies to ipfs

1. Create a `movie/` direcory and add `movie.mp4` and `thumbnail.png` or `.jpg`

   ```zsh
   mkdir movie
   ```

1. Add and pin movie to ipfs

   ```zsh
   ipfs add -r ./movie/

   # then
   ipfs pin add QmPzE1...
   ```

   > Next, You can run `ipfs ls QmPzE1rSLhhVvdfyAZkjAuf8KSCxtKbepPZJ99weKFcZHP` to see the contents of your movies e.g

   ```zsh
   QmVzmsRo6avD1HeBWY3WTUGdqvhya4KK999k77nFZS7i2S 63614462 bigbuck.mp4
   QmcgoEmVE3iSbqGS1Pr5Ad5jASMyGFBLA5wfHKKtb1vSRa 582477   thumbnail.png

   ```

1. You ca
