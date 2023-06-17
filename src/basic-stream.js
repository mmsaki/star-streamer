import fs from 'fs';
import through from 'through2';
import { finished } from 'stream/promises';

let input = process.argv[2];

const videoStream = fs.createReadStream(input);
let byteCount = 0;

export async function streamBytes() {
	videoStream.pipe(through(count, end));
	function count(buf, enc, next) {
		console.log('current buffer', buf);
		byteCount += buf.length;
		next();
	}

	async function end(next) {
		console.log('byte count', byteCount);
		next();
	}

	await finished(videoStream);

	console.log('Stream is done reading');
	console.log('Total bytes streamed:', byteCount);
	return byteCount;
}

streamBytes().catch(console.error);
videoStream.resume(); // drain the stream
