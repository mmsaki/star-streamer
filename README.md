# ipfs streaming

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

## Peer Streaming with hypercore

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

1. Next, let's can try stream movies ipfs

## Ipfs Implentation

1. [IPFS Live Streaming by Yurko,Elon, Benedict and Toronto Mesh](https://github.com/tomeshnet/ipfs-live-streaming) - Feed video file into the IPFS and distribute content hash
   1. OBS Studio
   1. OpenVPN
   1. Digital Ocean (Host HLS playlist over HTTP)
   1. NGINX with RTMP module (Video source from RTMP server)
   1. FFmpeg (create an HLS stream of chunks)
   1. IPFS (Add to IPFS) - Publish hash to rewrite m3u8 playlist file to IPNS ()
   1. Video.js
   1. Terraform

**Additional implementation**

> You can use FFMpeg to encode Video Stream into chunks and advertise to a gossip network. Possibly this is how scale the video streaming? - DougAnderson444#7580

1. Chunk video into mu8 playlist
1. To adveritise video chunks to a gossip channel using a gossip protocol, like pubsub
