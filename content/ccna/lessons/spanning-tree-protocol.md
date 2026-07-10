Redundant links keep networks alive — and, at Layer 2, they also create **loops** that can kill a network in seconds. **Spanning Tree Protocol (STP)** is the guardian that lets you have redundancy *without* the meltdown. It's one of the heaviest-weighted topics on the exam.

## Why loops are lethal at Layer 2

Connect two switches with two cables and send one broadcast. Each switch floods it to the other, which floods it back, forever — Ethernet frames have **no TTL**. Within seconds you get:

- **Broadcast storms** — looping frames multiply until links saturate.
- **MAC table instability** — the same MAC appears to flap between ports.
- **Duplicate frames** delivered to hosts.

The network doesn't degrade — it *collapses*.

## STP's strategy: block just enough

STP (IEEE **802.1D**) builds a loop-free logical tree by **blocking** redundant ports. The links still exist physically; if an active path fails, STP unblocks a backup. Redundancy on standby.

## The election, step by step

All decisions flow from **BPDUs** (Bridge Protocol Data Units) that switches exchange:

```diagram
{ "type": "flow", "title": "How STP converges", "direction": "vertical", "steps": [ { "label": "1. Elect the Root Bridge", "detail": "Lowest Bridge ID (priority, then lowest MAC) wins — one root per network" }, { "label": "2. Each non-root switch picks a Root Port", "detail": "Its single lowest-cost path toward the root" }, { "label": "3. Each segment gets a Designated Port", "detail": "The best port forwarding onto that link (all root bridge ports are designated)" }, { "label": "4. Everything else BLOCKS", "detail": "Remaining ports discard traffic — the loop is cut" } ] }
```

**Path cost** depends on link speed (classic short values): 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2. Lower total cost to root wins; ties break on neighbor bridge ID, then port ID.

```callout
{ "type": "exam", "body": "Root bridge election is THE guaranteed STP question. Bridge ID = priority (default 32768) + VLAN + MAC. Lower priority wins; tie → lower MAC wins. To force a root: 'spanning-tree vlan 10 priority 4096' or 'spanning-tree vlan 10 root primary'." }
```

## Port states

Classic 802.1D ports move through states before forwarding — a total of ~30–50 seconds:

- **Blocking** → listens to BPDUs only
- **Listening** (15 s) → participates in election
- **Learning** (15 s) → builds MAC table, still not forwarding
- **Forwarding** → normal operation

```sort
{ "prompt": "Order the classic STP port states from blocked to fully working", "items": ["Blocking", "Listening", "Learning", "Forwarding"] }
```

## RSTP — the modern default

Waiting 30–50 seconds per failover was unacceptable, so **RSTP (802.1w)** rebuilt convergence to happen in ~1–2 seconds. Cisco switches run **Rapid PVST+** by default — one RSTP instance *per VLAN* (so different VLANs can use different links, load-sharing the redundancy). RSTP port roles: **Root**, **Designated**, **Alternate** (backup path to root), **Backup**.

## Edge-port protections

Ports facing end devices shouldn't wait for STP or be exposed to rogue switches:

- **PortFast** — skip straight to forwarding on host ports (no 30 s wait for DHCP-hungry PCs).
- **BPDU Guard** — if a BPDU ever arrives on a PortFast port, **err-disable** it. A rogue switch was plugged in; kill the port.

```term
SW1(config)# interface range gi0/1 - 20
SW1(config-if-range)# spanning-tree portfast
SW1(config-if-range)# spanning-tree bpduguard enable
```

```match
{ "prompt": "Match the STP concept to its role", "pairs": [ { "left": "Root bridge", "right": "Reference point — lowest bridge ID wins" }, { "left": "Root port", "right": "A switch's best path toward the root" }, { "left": "Alternate port (RSTP)", "right": "Blocked backup path, ready to take over" }, { "left": "PortFast + BPDU Guard", "right": "Host ports: skip delays, block rogue switches" } ] }
```

```quiz
{ "question": "Three switches: SW1 priority 32768 MAC ...AAAA, SW2 priority 4096 MAC ...FFFF, SW3 priority 32768 MAC ...0001. Which becomes root bridge?", "options": ["SW1 — lowest MAC among defaults", "SW2 — lowest priority always wins first", "SW3 — lowest MAC overall", "They share the role per VLAN"], "answer": 1, "explanation": "Priority is compared BEFORE MAC. SW2's 4096 beats both 32768s regardless of MAC. (SW3's low MAC would only matter in a priority tie.)" }
```
