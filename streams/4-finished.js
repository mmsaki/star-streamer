import { finished } from 'stream/promises';
import { createReadStream } from 'fs';

const rs = createReadStream('archive.tar');

async function run() {
	await finished(rs);
	console.log('Stream is done reading.');
}

run().catch(console.error);
rs.resume(); // drain the stream
