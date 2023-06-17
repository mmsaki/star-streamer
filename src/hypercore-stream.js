import http from 'http';
import Hypercore from 'hypercore';
import Hyperswarm from 'hyperswarm';
import fs from 'fs';
import rangeParser from 'range-parser';

const key =
	process.argv[2] && process.argv[2] !== 'import'
		? Buffer.from(process.argv[2], 'hex')
		: null;
const core = new Hypercore('../tmp/movie' + (key ? '-peer' : ''), key);

if (process.argv[2] === 'import') {
	importData(process.argv[3]);
} else {
	start();
}

async function importData(filename) {
	const rs = fs.createReadStream(filename);
	for await (const data of rs) {
		await core.append(data);
	}
	console.log('done!', core);
}

async function start() {
	await core.ready();
	if (core.writable) {
		console.log('Share  this core key:', core.key.toString('hex'));
	}

	core.on('download', (index) => console.log('Downloaded block #' + index));
	const swarm = new Hyperswarm();
	swarm.on('connection', (socket) => core.replicate(socket));
	const discovery = swarm.join(core.discoveryKey);
	if (core.writable) {
		console.log('announcing');
		await discovery.flushed();
	} else {
		console.log('Finding peers');
		const done = core.findingPeers();
		swarm.flush().then(done, done);
		await core.update();
	}

	core.on('peer-remove', () => console.log('One has disconnected'));

	http
		.createServer(function (req, res) {
			res.setHeader('Content-Type', 'video/mp4');
			res.setHeader('Accept-Ranges', 'bytes');

			let byteOffset = 0;
			let byteLength = core.byteLength;

			if (req.headers.range) {
				const ranges = rangeParser(core.byteLength, req.headers.range);
				if (ranges === -1 || ranges === -2) {
					res.statusCode = 206;
					res.setHeader('Content-Length', 0);
					res.end();
					return;
				}
				const range = ranges[0];
				byteOffset = range.start;
				byteLength = range.end - range.start + 1;

				res.statusCode = 206;
				res.setHeader(
					'Content-Range',
					'bytes' + range.start + '-' + range.end + '/' + core.byteLength
				);
			}

			res.setHeader('Content-Length', byteLength);

			if (req.method === 'HEAD') {
				req.end();
				return;
			}

			const bs = core.createByteStream({ byteOffset, byteLength });
			bs.pipe(res, noop);
		})
		.listen(function () {
			const host = `http://localhost:${this.address().port}`;
			//  TODO:
			// document.getElementById('source').src = host;
			console.log(`http server on ${host}`);
		});
}

function noop() {}
