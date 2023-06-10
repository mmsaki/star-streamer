import fs from 'fs';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';

const helia = await createHelia();
const hfs = unixfs(helia);
const videoStream = fs.createReadStream('./video.mp4');
const cid = await hfs.addByteStream(videoStream, helia.blockstore);

const myPeerNode = helia.libp2p.peerId;
console.log('My PeerId: ', myPeerNode);
console.log('Video CID: ', cid);

for await (const chunk of hfs.cat(cid, {
	onProgress: (e) => {
		if (e.type === 'unixfs:exporter:walk:file') {
			console.log('File', e.detail.cid);
			// TODO: Decode e.detail.cid to --raw-leaves
			// console.log(hfs.cat(e.detail.cid));
		}
		if (e.type === 'unixfs:exporter:progress:unixfs:file') {
			console.log('bytesRead:', e.detail.bytesRead);
		}
	},
})) {
}

process.exit(0);
