import { createLibp2p } from 'libp2p';
import { circuitRelayTransport } from 'libp2p/circuit-relay';
import { identifyService } from 'libp2p/identify';
import { kadDHT } from '@libp2p/kad-dht';
import { webSockets } from '@libp2p/websockets';
import { webTransport } from '@libp2p/webtransport';
import { webRTCDirect, webRTC } from '@libp2p/webrtc';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import * as filters from '@libp2p/websockets/filters';
import delay from 'delay';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { CID } from 'multiformats/cid';
import all from 'it-all';

// helia + hypercore imports
import http from 'http';
import Hypercore from 'hypercore';
import Hyperswarm from 'hyperswarm';
import fs from 'fs';
import rangeParser from 'range-parser';
import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import through from 'through2';

document.addEventListener('DOMContentLoaded', async () => {
	const createNode = async () => {
		const libp2p = await createLibp2p({
			transports: [
				webTransport(),
				webSockets({
					filter: filters.all,
				}),
				webRTC({
					rtcConfiguration: {
						iceServers: [
							{
								urls: [
									'stun:stun.l.google.com:19302',
									'stun:global.stun.twilio.com:3478',
								],
							},
						],
					},
				}),
				webRTCDirect(),
				circuitRelayTransport({
					discoverRelays: 1,
				}),
			],
			connectionGater: {
				denyDialMultiaddr: async () => false,
			},
			connectionEncryption: [noise()],
			streamMuxers: [yamux(), mplex()],
			peerDiscovery: [
				bootstrap({
					list: [
						'/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiCnjFGSpzulEU2hkjieznLvNv-rNDNSaEGsueQKY9SsdQ/p2p/12D3KooWGMvHEupxeBbq2q1cutM6JR9FKB2nQtSwqUYkZrYgHKKR',
						'/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiD38JeBzR-uv2Q6zMln6kRRGlAFFLPNCNTkxAdWr0fVwA/p2p/12D3KooWN1dAxwTevXLPQ8Gsoyje6eajQKzA4Kq3hDPeuBgo5nFE',
					],
				}),
			],
			services: {
				pubsub: gossipsub({
					allowPublishToZeroPeers: true,
					ignoreDuplicatePublishError: true,
				}),
				identify: identifyService(),
				dht: kadDHT({
					protocolPrefix: '/star-streamer',
					maxInboundStreams: 5000,
					maxOutboundStreams: 5000,
					clientMode: true,
				}),
			},
		});
		return libp2p;
	};

	const libp2p = await createNode();

	// subscribe to pubsub
	libp2p.services.pubsub.subscribe('star-streamer');

	// publish messages
	libp2p.services.pubsub.publish(
		'star-streamer',
		uint8ArrayFromString('hello streamer')
	);

	// UI elements
	const status = document.getElementById('status');
	const output = document.getElementById('output');
	const multiaddrs = document.getElementById('multiaddrs');

	output.textContent = '';
	multiaddrs.textContent = '';

	function log(txt) {
		console.info(txt);
		// output.textContent += `${txt.trim()}\n`;
		const newLine = document.createElement('p');
		newLine.textContent = `${txt.trim()}\n`;
		if (txt.toLowerCase().includes('could not dial')) {
			newLine.style.color = 'red';
		}
		if (txt.toLowerCase().includes('connected')) {
			newLine.style.color = 'green';
		}
		if (txt.toLowerCase().includes('found peer')) {
			newLine.style.color = 'green';
		}
		output.append(newLine);
	}

	// Listen for new peers
	libp2p.addEventListener('peer:discovery', (evt) => {
		const peerInfo = evt.detail;
		log(`[Found peer]: ${peerInfo.id.toString()}`);

		// dial them when we discover them
		libp2p.dial(peerInfo.id).catch((err) => {
			log(`[Could not dial]: ${peerInfo.id.toString()}`, err);
		});
	});

	// Listen for new connections to peers
	libp2p.addEventListener('peer:connect', (evt) => {
		const peerId = evt.detail;
		log(`[Connected]: ${peerId.toString()}`);
	});

	// Listen for peers disconnecting
	libp2p.addEventListener('peer:disconnect', (evt) => {
		const peerId = evt.detail;
		log(`[Disconnected]: ${peerId.toString()}`);
	});

	// Listen for messages
	libp2p.services.pubsub.addEventListener('message', (evt) => {
		const message = evt.detail;
		log(`[message]: ${uint8ArrayToString(message.data)}`);
	});

	status.innerText = 'libp2p started!';
	log(`[Peer ID]: ${libp2p.peerId.toString()}`);

	// Send stream
	libp2p.handle('/star-streamer', ({ stream }) => {
		pipe(stream, async function (source) {
			for await (const msg of source) {
				console.log(uint8ArrayToString(msg.subarray()));
			}
		});
	});

	// CREATE HELIA BYTE STREAM
	const getStream = async () => {
		const helia = await createHelia();
		const hfs = unixfs(helia);
		const videoStream = fs.createReadStream('../movie/bigbuck.mp4');
		const cid = await hfs.addByteStream(videoStream, { rawLeaves: true });

		const myPeerNode = helia.libp2p.peerId;
		console.log('My PeerId: ', myPeerNode);
		console.log('Video CID: ', cid);

		let byteCount = 0;

		for await (const chunk of hfs.cat(cid)) {
			byteCount += chunk.length;
			console.log(chunk);
		}
		console.log('Total Bytes', byteCount);
		return { cid, byteCount };
	};
	// normal way

	// const videoStream = fs.createReadStream('../movie/bigbuck.mp4');
	// console.log(videoStream);
	// let byteCount = 0;

	// async function streamBytes() {
	// 	videoStream.pipe(through(count, end));
	// 	function count(buf, enc, next) {
	// 		console.log('current buffer', buf);
	// 		byteCount += buf.length;
	// 		next();
	// 	}

	// 	async function end(next) {
	// 		console.log('byte count', byteCount);
	// 		next();
	// 	}

	// 	console.log('Stream is done reading');
	// 	console.log('Total bytes streamed:', byteCount);
	// 	return byteCount;
	// }

	// streamBytes().catch(console.error);

	// const key =
	// 	process.argv[2] && process.argv[2] !== 'import'
	// 		? Buffer.from(process.argv[2], 'hex')
	// 		: null;

	// // if (process.argv[2] === 'import') {
	// 	importData(process.argv[3]);
	// } else {
	// 	start();
	// }

	// async function start() {
	// 	await core.ready();
	// 	if (core.writable) {
	// 		console.log('Share  this core key:', core.key.toString('hex'));
	// 	}

	// 	core.on('download', (index) => console.log('Downloaded block #' + index));
	// 	const swarm = new Hyperswarm();
	// 	swarm.on('connection', (socket) => core.replicate(socket));
	// 	const discovery = swarm.join(core.discoveryKey);
	// 	if (core.writable) {
	// 		console.log('announcing');
	// 		await discovery.flushed();
	// 	} else {
	// 		console.log('Finding peers');
	// 		const done = core.findingPeers();
	// 		swarm.flush().then(done, done);
	// 		await core.update();
	// 	}
	// }

	// core.on('peer-remove', () => console.log('One has disconnected'));

	// http.createServer(function (req, res) {
	// 	res.setHeader('Content-Type', 'video/mp4');
	// 	res.setHeader('Accept-Ranges', 'bytes');

	// 	let byteOffset = 0;
	// 	let byteLength = core.byteLength;

	// 	if (req.headers.range) {
	// 		const ranges = rangeParser(core.byteLength, req.headers.range);
	// 		if (ranges === -1 || ranges === -2) {
	// 			res.statusCode = 206;
	// 			res.setHeader('Content-Length', 0);
	// 			res.end();
	// 			return;
	// 		}
	// 		const range = ranges[0];
	// 		byteOffset = range.start;
	// 		byteLength = range.end - range.start + 1;

	// 		res.statusCode = 206;
	// 		res.setHeader(
	// 			'Content-Range',
	// 			'bytes' + range.start + '-' + range.end + '/' + core.byteLength
	// 		);
	// 	}

	// 	res.setHeader('Content-Length', byteLength);

	// 	if (req.method === 'HEAD') {
	// 		req.end();
	// 		return;
	// 	}

	// 	const bs = core.createByteStream({ byteOffset, byteLength });
	// 	bs.pipe(res, function () {});
	// });
	// .listen(function () {
	// 	const host = `http://localhost:${this.address().port}`;
	// 	//  TODO:
	// 	// document.getElementById('source').src = host;
	// 	console.log(`http server on ${host}`);
	// });

	// Export libp2p to the window so you can play with the API
	window.libp2p = libp2p;
});

// export async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
// 	var enc = new TextEncoder();

// 	const signedMessage = msg as SignedMessage;
// 	const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString());
// 	return await sha256.encode(encodedSeqNum);
// }
