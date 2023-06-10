import fs from 'fs';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import through from 'through2';

const input = process.argv[2];

let byteCount = 0;

const videoStream = fs.createReadStream(input);

function write(buf, enc, next) {
	console.log('current buffer', buf);
	byteCount += buf.length;
	next();
}

function end(next) {
	console.log('byte count', byteCount);
	next();
}

videoStream.pipe(through(write, end));
