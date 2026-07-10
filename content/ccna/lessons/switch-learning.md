A switch has no configuration telling it where devices live — it **teaches itself**, one frame at a time. This self-learning logic is the beating heart of every LAN, and the exam tests it relentlessly.

## The MAC address table

A switch keeps one crucial data structure: the **MAC address table** (also called the CAM table) — a mapping of *MAC address → port*.

```term
Switch# show mac address-table dynamic
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    3c52.824f.9ad1    DYNAMIC     Gi0/1
   1    58ef.681a.2b3c    DYNAMIC     Gi0/2
   1    b4a9.fc11.07e2    DYNAMIC     Gi0/7
```

## The three rules of switching

For every frame that arrives, the switch applies exactly this logic:

```diagram
{ "type": "flow", "title": "What a switch does with every frame", "direction": "vertical", "steps": [ { "label": "1. LEARN", "detail": "Record the SOURCE MAC + arrival port in the MAC table (refresh the 300s timer if already known)" }, { "label": "2. DECIDE", "detail": "Look up the DESTINATION MAC in the table" }, { "label": "3. FORWARD or FLOOD", "detail": "Known unicast → send out that one port. Unknown unicast, broadcast, or multicast → flood out ALL ports except the one it arrived on" } ] }
```

Two vocabulary terms fall out of rule 3:

- **Known unicast** — destination is in the table → precise forwarding.
- **Unknown unicast** — destination *not* in the table → **flood** everywhere and let the right host answer (which then teaches the switch its port).

Entries age out after **300 seconds** of silence by default, keeping the table fresh as devices move.

```sort
{ "prompt": "A frame arrives at a switch. Order the switch's processing steps", "items": ["Learn the source MAC and port into the table", "Look up the destination MAC", "Forward out the known port — or flood if unknown"] }
```

## Walking through a cold start

Switch boots with an empty table. PC-A (port 1) pings PC-B (port 2):

1. A's frame arrives → switch **learns** A is on port 1. Destination (B) unknown → **floods** out ports 2, 3, 4…
2. B replies → switch **learns** B is on port 2. Destination (A) is known → forwards **only** to port 1.
3. From now on, A↔B traffic flows port-to-port. No other device sees it.

That last point is the security and performance win over ancient hubs, which repeated everything everywhere.

## Collision domains and broadcast domains

Two "blast radius" concepts the exam loves:

- **Collision domain** — where transmissions can collide. **Every switch port is its own collision domain** (full-duplex kills collisions entirely).
- **Broadcast domain** — how far a broadcast frame reaches. **An entire switch (per VLAN) is one broadcast domain**; only **routers** (or VLAN boundaries) stop broadcasts.

```match
{ "prompt": "Match the device to what it does to the domains", "pairs": [ { "left": "Hub", "right": "One big collision domain, one broadcast domain" }, { "left": "Switch", "right": "Collision domain per port; one broadcast domain per VLAN" }, { "left": "Router", "right": "Separates BOTH collision and broadcast domains" } ] }
```

```callout
{ "type": "exam", "body": "Count-the-domains questions are guaranteed: a 24-port switch with all ports in one VLAN = 24 collision domains, 1 broadcast domain. Add a router between two switches = 2 broadcast domains." }
```

```quiz
{ "question": "A switch receives a frame for destination MAC B4:A9:FC:11:07:E2, which is NOT in its MAC table. What does it do?", "options": ["Drops the frame until the MAC is learned", "Sends an ARP request to find the device", "Floods the frame out all ports except the arrival port", "Sends it to the default gateway"], "answer": 2, "explanation": "Unknown unicast = flood. The switch sends it everywhere (except where it came from); when the target replies, its source MAC teaches the switch the right port. Switches never generate ARP requests for transit traffic — that's a host/router behavior." }
```
