import fs from 'fs';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { finished } from 'stream/promises';

const helia = await createHelia();
const hfs = unixfs(helia);
const videoStream = fs.createReadStream(process.argv[2]);
const cid = await hfs.addByteStream(videoStream, { rawLeaves: true });

const myPeerNode = helia.libp2p.peerId;
console.log('My PeerId: ', myPeerNode);
console.log('Video CID: ', cid);

let byteCount = '';

async function main() {
	for await (const chunk of hfs.cat(cid, {
		onProgress: (e) => {
			if (e.type === 'unixfs:exporter:walk:file') {
				console.log('leaf node', e.detail.cid);
				// TODO: Decode e.detail.cid to --raw-leaves
				// console.log(hfs.cat(e.detail.cid));
			}
			if (e.type === 'unixfs:exporter:progress:unixfs:file') {
				console.log('bytesRead:', e.detail.bytesRead);
				byteCount = e.detail.bytesRead.toString();
			}
		},
	})) {
	}
	console.log('Total Bytes', byteCount);
	return byteCount;
}

main().catch(console.error);
videoStream.resume(); // drain stream
