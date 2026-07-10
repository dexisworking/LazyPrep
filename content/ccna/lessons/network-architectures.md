Topologies describe shapes; **architectures** describe blueprints — proven ways to arrange switches and routers so a network scales, survives failures, and stays manageable. The CCNA expects you to recognize the standard blueprints on sight.

## The three-tier campus

Cisco's classic design for large campus networks stacks three layers of switches:

```diagram
{ "type": "layers", "title": "Three-tier campus architecture", "layers": [ { "label": "Core layer", "detail": "The backbone — switch packets as fast as possible, nothing else", "badge": "3" }, { "label": "Distribution layer", "detail": "Aggregates access switches; routing, policy, redundancy live here", "badge": "2" }, { "label": "Access layer", "detail": "Where end devices plug in; port security, PoE for phones/APs", "badge": "1" } ] }
```

- **Access layer** — the only layer end devices touch. Lots of ports, Power over Ethernet (PoE) for phones and APs, security features per port.
- **Distribution layer** — aggregates access switches, applies policy (ACLs, QoS marking), and is typically the **Layer 2/Layer 3 boundary**.
- **Core layer** — pure speed. Design mantra: *never do anything at the core that slows it down.*

## Two-tier (collapsed core)

Most mid-size networks don't need a separate core. A **collapsed core** merges core + distribution into one layer — cheaper, simpler, and perfectly valid. Recognizing "two-tier = collapsed core" is a free exam point.

## Spine-leaf — the data center blueprint

Server traffic is mostly **east-west** (server to server), so data centers use **spine-leaf**:

- Every **leaf** switch (top-of-rack, where servers plug in) connects to **every spine** switch.
- No leaf-to-leaf or spine-to-spine links.
- Result: any server is exactly **two hops** from any other (leaf → spine → leaf) with predictable latency and easy horizontal scaling — need more capacity? Add a spine.

```diagram
{ "type": "compare", "title": "Campus vs Data Center design", "left": { "title": "Three-tier campus", "items": ["Optimized for north-south traffic (users ↔ services)", "Access → Distribution → Core", "Policy at distribution", "Scales by adding access switches"] }, "right": { "title": "Spine-leaf DC", "items": ["Optimized for east-west traffic (server ↔ server)", "Every leaf connects to every spine", "Consistent 2-hop latency", "Scales by adding spines/leaves"] } }
```

## Small office / home office (SOHO)

At the other extreme, a **SOHO** network collapses *everything* — router, switch, AP, firewall — into one box. Architecturally boring, operationally everywhere: it's what your home runs, and what branch offices deploy in miniature.

```sort
{ "prompt": "A frame travels from a campus PC to a server in another building. Order the switch layers it crosses going UP the hierarchy", "items": ["Access layer (PC's switch)", "Distribution layer (aggregation)", "Core layer (backbone)"] }
```

## Redundancy is the point

Every architecture above exists to answer one question: *what happens when something fails?* Dual links, dual distribution switches, meshed cores — the patterns you'll learn later (STP, EtherChannel, FHRP) are the mechanics that make these redundant designs actually work without loops or confusion.

```quiz
{ "question": "A growing company's data center sees massive server-to-server (east-west) traffic. Which architecture is purpose-built for this pattern?", "options": ["Three-tier campus", "Collapsed core", "Spine-leaf", "SOHO"], "answer": 2, "explanation": "Spine-leaf gives every server a consistent two-hop path to any other server, which is exactly what east-west heavy data centers need. Three-tier and collapsed-core target campus north-south traffic." }
```
