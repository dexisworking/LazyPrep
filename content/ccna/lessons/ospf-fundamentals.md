**OSPF (Open Shortest Path First)** is the enterprise routing protocol — open-standard, fast-converging, and the only IGP the CCNA tests in depth. This lesson covers how it thinks; the next covers how you configure it.

## The link-state idea, concretely

Every OSPF router originates **LSAs (Link-State Advertisements)** describing its links. LSAs are flooded until every router holds an identical **LSDB (Link-State Database)** — the complete network map. Then each router independently runs **Dijkstra's SPF algorithm** over the map, computing the shortest-path tree from *itself* to everywhere.

Same map + same algorithm = consistent, loop-free routing.

```diagram
{ "type": "flow", "title": "OSPF's pipeline", "steps": [ { "label": "Hello", "detail": "Discover neighbors, verify compatibility" }, { "label": "Database exchange", "detail": "Synchronize LSDBs (full adjacency)" }, { "label": "SPF computation", "detail": "Dijkstra over the shared map" }, { "label": "Routing table", "detail": "Best routes installed with AD 110" } ] }
```

## Becoming neighbors — the checklist

Routers exchange **Hello packets** (multicast `224.0.0.5`, every 10 s on Ethernet). To form a neighborship, these must MATCH:

- **Area ID**
- **Subnet** (same network + mask)
- **Hello and Dead timers** (10/40 s defaults)
- **Authentication** (if configured)

And these must be **unique**: **Router IDs** — a 32-bit ID per router (highest loopback IP by default, or explicitly set — always set it explicitly).

```callout
{ "type": "exam", "body": "\"Two routers won't form an OSPF adjacency — why?\" Check the matching list: mismatched timers, different areas, different subnets, duplicate router IDs, or one interface passive. This troubleshooting question appears in nearly every exam pool." }
```

Neighbor states you should recognize: **Down → Init → 2-Way → ExStart → Exchange → Loading → Full**. "Full" = synchronized. Stuck in 2-Way can be normal (non-DR routers on a LAN); stuck in ExStart/Exchange usually means MTU mismatch.

## Cost — OSPF's metric

Each interface has a **cost = reference bandwidth ÷ interface bandwidth** (default reference: 100 Mbps). Route cost = sum of outgoing interface costs.

Default reference makes FastEthernet, Gigabit, and 10G ALL cost 1 — useless on modern gear. Fix on every router:

```term
R1(config-router)# auto-cost reference-bandwidth 100000
```

Now 100G=1, 10G=10, 1G=100.

## DR/BDR — order on shared segments

On a multi-access LAN, N routers would need N(N−1)/2 adjacencies. OSPF instead elects a **Designated Router (DR)** and **Backup DR (BDR)**; everyone else (DROthers) synchronizes only with them.

- Election: highest **interface priority** (default 1) wins; tie → highest **router ID**.
- Priority **0** = never participate.
- No preemption: a new "better" router doesn't steal an existing DR's job.

```sort
{ "prompt": "Order the OSPF neighbor states on the way to full adjacency", "items": ["Down", "Init", "2-Way", "ExStart", "Exchange", "Loading", "Full"] }
```

## Areas — scaling the map

One shared map works until it doesn't: SPF on thousands of routers is expensive, and every flap floods everywhere. **Areas** partition the domain:

- **Area 0 (backbone)** — the hub; all other areas must touch it.
- **ABRs (Area Border Routers)** — sit between areas, summarize between maps.
- Detail stays inside an area; only summaries cross. Smaller LSDBs, faster SPF, contained flapping.

The CCNA focuses on **single-area** configuration but expects the multi-area vocabulary.

```match
{ "prompt": "Match the OSPF term to its meaning", "pairs": [ { "left": "LSDB", "right": "The shared topology map" }, { "left": "Area 0", "right": "The mandatory backbone area" }, { "left": "ABR", "right": "Router bridging two areas" }, { "left": "DR", "right": "Adjacency hub on a multi-access LAN" } ] }
```

```quiz
{ "question": "Four routers share an Ethernet segment: R1 (priority 0, RID 4.4.4.4), R2 (priority 1, RID 3.3.3.3), R3 (priority 1, RID 9.9.9.9), R4 (priority 5, RID 1.1.1.1). Who becomes DR?", "options": ["R1 — highest RID among them", "R3 — highest RID with default priority", "R4 — highest priority wins", "R2 — lowest RID wins"], "answer": 2, "explanation": "Priority is compared first: R4's 5 beats the default 1s, and R1's priority 0 removes it from the election entirely. RID (9.9.9.9 etc.) would only break a priority tie." }
```
