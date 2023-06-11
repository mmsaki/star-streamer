import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';

const helia = await createHelia();
const hfs = unixfs(helia);

const cid = CID.parse(process.argv[2]);

console.log('Video CID', cid);

let video = null;
let events = {};

for await (const chunk of hfs.cat(cid, {
	onProgress: (e) => {
		// console.log('cat event', e.type, e.detail);
		// console.dir(e);
		// if (!(e.type.toString() in events)) {
		// 	events[e.type.toString()] = 1;
		// 	console.log(events);
		// }
		if (e.type === 'blocks:get:bitswap:get') {
			console.log('Block found:', e.type, e.detail);
		} else {
			// console.log('Connection to peers ...');
		}
	},
})) {
}
