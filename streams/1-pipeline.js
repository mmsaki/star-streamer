import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

await pipeline(
	createReadStream('archive.tar'),
	createGzip(),
	createWriteStream('archive.tar.gz')
);

console.log('Pipeline succeeded');
