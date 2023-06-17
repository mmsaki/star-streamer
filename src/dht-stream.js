// kad-dht 3 APIs: Peer Routing, Content Routing and Peer Discover
import { createLibp2p } from 'libp2p';
import { kadDHT } from '@libp2p/kad-dht';
import { tcp } from '@libp2p/tcp';

const node = await createLibp2p({
	dht: kadDHT({
		transports: [tcp()],
	}),
});

await node.start();

for await (const event of node.dht.findPeer(node.peerId)) {
	console.log(event);
}
