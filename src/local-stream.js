import fs from 'fs';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';

const helia = await createHelia();
const hfs = unixfs(helia);
const videoStream = fs.createReadStream('./video.mov');
const cid = await hfs.addByteStream(videoStream);

console.log('Video CID', cid);

let video = null;

for await (const chunk of hfs.cat(cid, {
	onProgress: (e) => {
		console.log('cat event', e.type, e.detail);
	},
})) {
}

videoStream.once('end', function () {
	console.log('END');
});

videoStream.on('finish', function () {
	console.log('FINISHED');
});
