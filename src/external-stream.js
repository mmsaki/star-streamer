import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';

const helia = await createHelia();
const hfs = unixfs(helia);

const cid = CID.parse(process.argv[2]);

console.log('Video CID', cid);

let video = null;

for await (const chunk of hfs.cat(cid, {
	onProgress: (e) => {
		console.log('cat event', e.type, e.detail);
		// console.dir(e);
		if (e.type === 'kad-dht:query:peer-response') {
		} else {
			// console.log('Sending query ...');
		}
	},
})) {
}
