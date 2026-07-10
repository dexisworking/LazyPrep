Typing static routes for a 200-router network is a resignation letter in slow motion. **Dynamic routing protocols** let routers introduce themselves, exchange what they know, and reroute around failures — automatically. This lesson maps the protocol landscape before we go deep on OSPF.

## What every routing protocol does

1. **Discover neighbors** — find adjacent routers speaking the same protocol.
2. **Exchange routes** — share known networks.
3. **Choose best paths** — via a **metric** (each protocol defines its own).
4. **React to change** — links die, routers reboot; the protocol **converges** on new paths.

## The family tree

```diagram
{ "type": "layers", "title": "Routing protocol taxonomy", "layers": [ { "label": "IGP vs EGP", "detail": "Interior (inside your org) vs Exterior (between orgs)", "badge": "1" }, { "label": "IGPs: OSPF, EIGRP, RIP, IS-IS", "detail": "Run within an autonomous system", "badge": "2" }, { "label": "EGP: BGP", "detail": "The Internet's routing protocol — between autonomous systems", "badge": "3" } ] }
```

Within IGPs, two philosophies:

- **Distance vector** (RIP, EIGRP*) — "I trust my neighbor's summary." Routers know *distances and directions*, not the map. Simple, but slower to converge and loop-prone (RIP's fixes: hop limit 15, split horizon).
- **Link state** (OSPF, IS-IS) — "everyone gets the full map." Routers flood link information until all share an identical topology database, then each computes shortest paths itself (Dijkstra/SPF). Fast convergence, loop-free by construction, more CPU/memory.

*EIGRP is officially an "advanced distance vector" — Cisco-born, smarter than RIP, but still neighbor-summary based.

```diagram
{ "type": "compare", "title": "Distance vector vs Link state", "left": { "title": "Distance vector", "items": ["Learns routes from neighbors' tables", "Knows distance + direction only", "RIP: hop count metric, max 15", "Simple, slower convergence"] }, "right": { "title": "Link state", "items": ["Floods link info — full shared map", "Each router runs SPF itself", "OSPF: cost metric (bandwidth-based)", "Fast convergence, loop-free"] } }
```

## Metrics — what "best" means

Each protocol scores paths differently:

| Protocol | Metric | Meaning |
|---|---|---|
| RIP | Hop count | Fewest routers (blind to speed!) |
| OSPF | Cost | Sum of interface costs (∝ 1/bandwidth) |
| EIGRP | Composite | Bandwidth + delay formula |
| BGP | Path attributes | Policy, not speed |

RIP's flaw makes a great exam scenario: it prefers a 2-hop path over 56k modems to a 3-hop gigabit path. OSPF, weighing bandwidth, chooses sanely — a big reason it won the enterprise.

```match
{ "prompt": "Match the protocol to its identity", "pairs": [ { "left": "OSPF", "right": "Link-state IGP, open standard, cost metric" }, { "left": "EIGRP", "right": "Advanced distance vector, Cisco-origin" }, { "left": "RIP", "right": "Legacy distance vector, 15-hop limit" }, { "left": "BGP", "right": "The EGP that routes the Internet" } ] }
```

## Convergence — the quality that matters

**Convergence** = all routers agreeing on the topology after a change. Until convergence completes, packets can loop or blackhole. Modern link-state protocols converge in seconds or less; RIP could take minutes. When engineers argue protocols, they're usually arguing convergence speed vs complexity.

```callout
{ "type": "exam", "body": "Classification questions are free points: OSPF = link-state + open + AD 110; EIGRP = distance vector (advanced) + AD 90; RIP = distance vector + AD 120; BGP = path vector EGP + AD 20 (eBGP). Make a flashcard of that sentence." }
```

```quiz
{ "question": "Path A: 2 hops over 100 Mbps links. Path B: 3 hops over 10 Gbps links. Which protocol picks the objectively faster Path B?", "options": ["RIP — fewer hops wins", "OSPF — lower cumulative cost via high-bandwidth links", "Both pick Path B", "Neither; routers always prefer fewer hops"], "answer": 1, "explanation": "OSPF's cost derives from bandwidth, so three 10G hops cost far less than two 100M hops. RIP counts only hops and would blindly choose the slower Path A — exactly why hop count is a naive metric." }
```
