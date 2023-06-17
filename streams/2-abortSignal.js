import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

const ac = new AbortController();
const { signal } = ac;
setImmediate(() => ac.abort());

try {
	await pipeline(
		createReadStream('archive.tar'),
		createGzip(),
		createWriteStream('archive.tar.gz'),
		{ signal }
	);
} catch (error) {
	console.error(error);
}
