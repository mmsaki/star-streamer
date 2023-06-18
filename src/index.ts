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
import type { Message, SignedMessage } from '@libp2p/interface-pubsub';
import * as filters from '@libp2p/websockets/filters';
import delay from 'delay';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';

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
					// msgIdFn: msgIdFnStrictNoSign,
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
	// console.log(uint8ArrayFromString(new Uint8Array(15)));

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
		log(`[message]: ${message.data.toString()}`);

		console.log(message.data);
	});

	status.innerText = 'libp2p started!';
	log(`[Peer ID]: ${libp2p.peerId.toString()}`);

	// node.pubsub.addEventListener('stream:inbound', (evt) => {
	// 	const detail = evt.detail;
	// 	log(`[stream:inbound] ${detail.toString()}`);
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
