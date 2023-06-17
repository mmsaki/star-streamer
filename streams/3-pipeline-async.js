import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

await pipeline(
	createReadStream('lowercase.txt'),
	async function* (source, { signal }) {
		source.setEncoding('utf8'); // convert to strings rather than buffers
		for await (const chunk of source) {
			yield await processChunk(chunk, { signal });
			console.log(chunk, Date.now());
		}
		yield 'asd';
	},
	createWriteStream('uppercase.txt')
);

console.log('Pipeline succeeded');

function processChunk(buf, enc, next) {
	return buf.toUpperCase();
}
