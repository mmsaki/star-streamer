# gossipsub

## introduction

1. blockchains require a messaging layer to propagate messages about transactions
1. block messags are produced by a subnet of nodes, the miner nodes, to group a set of transactions together, update the state of the blockchain and keep all the nodes in sync
1. It is the task of the messaging protocol to keep the network in sync and up to date
1. The nature of blockchains being permissionless means that new nodes can join the network if they run the protocol
1. Malicious nodes can, therefore, join and try to distort the view of nodes with regards to latest transactions and blocks with the aim of disrupting the network or stealing monetary value
1. Malicious activity is most commonly realised through Sybil nodes that can carry out a range of attacks, most prominnt of which is the eclipse attack
1. The eclipse attack is the silencing of nodes in order to cause packet loss and in turn, blockchain forks
1. Given that those networks carry large amounts of menetary value, potentially in the order of hundreds of millions of dollars, they are very attractive to attackers
1. Therefore, the messaging layer protocol of a blockchain network has to be resilient against makicious nodes that attack the network by dropping or delaying messages
1. the most straighforward strategy to akkeviate bith message propagation speed and resilience/security concerns in permissionless instructured p2p networks is flooding - used in the bitcoin network
1. flooding ensures that messages propagate as fast as possible throughout the network and is robust against eclipse attacks, as it introduces high levels of traffic redundancy
1. flooding however is very expensive in terms of bandwidth, report that 44% of the overall traffic of the bitcoin network is redundant
1. the figure translates to a bandwidth requirment of up to 350gbs/month for a public Bitcoin node and for the current network size
1. Gossip based pubsib protocols have been introduced in the past as a way to limit the number iof messages propagated between peers in oub/sub system
1. In gossip-based approaches, peers forward metadata related to messages thet have "seen" without forwarding the messages themselves, a method generally called lazy pull
1. However, given that past systems were either centralised, they were not designed to be resilient against attacks
1. Gossipsub, is a gossip-based pubsun protocol that is designed to deal with both fast and resilient message propagation in permissionless networks
1. Gossipsub consists of two main components, the mesh construction and the score function, as well as a set of mitigation mechanisms designed exclusively on top of the two protocol components
1. The combination of these parts render the protocol resilient against a wide-range of attacks, responsive to dynamic network conditions and fast in terms of message propagation

   **1. The Mesh Construction**

   1. GossipSub intoduces a connected global mesh structure, where each node is connected to a limited number of other peers forming its local view of the mesh.
   1. Mesh-connected nodes directly share messages with with one another, e=realising an eager push communication model
   1. Nodes can join and leave tht mesh based on network level conditions or application-level semantics
   1. Those nodes that are not part of the mesh communicate with mesh-connected nodes through gossip (lazy push)

   **2. The Score Function**

   1. every node participating in the network is constantly being observed by all the nodes it is connected to
   1. Whether in the same locol mesh or not
   1. We have carefully selected a number of actions that either flag malicious activity e.g dropped messages, or highligh good behavior e.g fast message delivery and have built a weight-based scoring function to rank peers accorfding to their behavior in the network
   1. every peer keeps a score for every other peer it is connected to and does not share this score with others
   1. Instead, it makes routing and relaying decisions based on its own view of other nodes

   **3. The Mitigation Strategies**

   1. Building directly on the properties intoduced by the mesh construction and the scoring fucntion, we complement GossipSUb with a set of mitigation strategies to protect its operation against malicious activity
   1. these strategies include
   1. Controlled mesh maintenance through score-driven participation, scoped flooding for newly published messages
   1. Score-based node isolation when malicious activity is detected

1. in gossipsub based systems, all nodes start equal and build their profile basd on their behavior
1. Well behaved nodes are generally part of the mesh
1. nodes with questionable or malicious intentions are progressively excluded from the mesh to the gossip network and then from the network as a whole
1. Gossipsub is the first of its kind protocol that addresses both the spped and the resilience challenges of permissionless message propagation environments that carry high menetary value
1. it has been adopted and is currently been integrated as the main transaction and block propagation protocol in the Filecoin Network, and incentivised, decentralised strorage network
1. it is also integrated in the Ethereum 2.0 network, a decentralized smart contract computation network
1. These systems are primarily financial systems at the transaction and block propagation level and are expected to carry transaction messages potentially worth millions in menetary value
1. The performance and security properties of GossipSub need to be investigated in detail
1. It is impeative to detail the performance and security properties of GossipSub, which is the primary focus

1. Ethereum will have many topics as part of the messaging protocol, with up to 70 and with possibility to increase to a few hundred topics that the pubsub protocol will have to handle
1. the overall size of the network is expected to be in the ara of 5k-10k with not all nodes subscribed to all topics
1. The load in terms of message rates will be larger in eth2.0 than filecoin, expected in the area of tens of messages per second per topic

## prior art in pubsub

1. pubsub systems have been deployed stensively in commercial settings in the past with several requirements in mind
1. First, include reliable delivery in presence of node churn
1. Load balancing amongnst message relay nodes
1. Scalability as networks grow
1. Resource efficiency to avoid excessive deplicate message delivery
1. Gossip-based approaches have also received considerable attention, due to the balance they bring between bandwidth consumption and performance guarantees
1. While these proposals have helped advance the topic of pubsub, none of them has been designed with sybil resistance in mind
1. Instead, security in pubsub systems has investigated issues related to message encryption, digital signatures and access control
1. The performance penalty of conventional pubsub protocols without security protections is so servere in case of attacks that protocol design decisions have virtually no effect
1. these protocols do not constitute direct points of comparison for gossipsub
1. we focus on comparing the behavior of gossipsub against message propagation protocols used in similar environments, that is, flooding in the bitcoin and sqrt(N) in the ETH1.0 blockchain

## Attack types on permissionless blockchains

> Given the permissionless environment of blockchain networks, a message propagation protocol needs to be resistant against the following list of primitive attacks.

> All of them target delayed message propagation and eventually forking the blockchain

1. **Sybil attacks**: This is the most common form of attack on p2p networks, since creating large number of identities is generally cheap resource-wise, unless cryptographic puzzles are included as part of joining the system

   1. In the case of gossipsub, sybils will attempt to get into the mesh, through a process called grafting
   1. This is the first step for carrying out all the following attacks

1. **Eclipse Attack**: This attack can be carried out against a single victim or the while network

   1. the objective is to silence the victim by refusing to propagate messages from it
   1. or to distort its view by delaying message propagation towards it

1. **Censorship Attack**: Sybils seek to establish themselves in the mesh and propagate all messages except thos published by the target peer

   1. In contrast to the eclipse attack, in the censorship attack, sybils appeat to behave properly from all vantage points but, hairpin-drop the victim's messages
   1. The objective of the attacker is to censor the target and prevent messages from reaching the rest of the network
   1. This attack os difficult to detect by monitoring and scoring peers, as the sybils build up a score by virtue of propagating all other messages

1. **Coll Boot Attack**: in this attack, honest and sybil nodes join concurrently when the network bootstraps

   1. Honest peers attempt to build their mesh, while connection to both sybil and honest peers
   1. Since there is no score built up from a warm, honest-only network to protect the mesh, the sybils manage to largely take over
   1. the attack can take place on two cases
      1. when the network bootstraps with sybils joining at t0
      1. when new nodes are joining the network while the network is under attack
      1. The second is likely to occur as the network grows

1. **Flash & Convert Flash Attack**: in this attack, sybils connect and attack the nework at once
   1. In the convert flash attack, sybils connect to the network but behave properly for some time in order to build up score
   1. Then, they execute a coordinated attack whereby they stip propergating messages altogether in an attempt to completely disrupt the network
   1. The attack is difficult to identify before the attackers turn malicious as they behave properly up to that poinr and build a good profile
