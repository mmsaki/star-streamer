import fs from 'fs';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { finished } from 'stream/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const helia = await createHelia();
const hfs = unixfs(helia);
const videoStream = fs.createReadStream('../movie/bigbuck.mp4');
const cid = await hfs.addByteStream(videoStream, { rawLeaves: true });

const myPeerNode = helia.libp2p.peerId;
console.log('My PeerId: ', myPeerNode);
console.log('Video CID: ', cid);

let byteCount = 0;

async function main() {
	for await (const chunk of hfs.cat(cid)) {
		byteCount += chunk.length;
		console.log(chunk);
	}
	console.log('Total Bytes', byteCount);
	return byteCount;
}

main().catch(console.error);
videoStream.resume(); // drain stream
