A switch asks "which port owns this MAC?" A router asks a harder question: "of everything I know about the world, which path best matches this destination?" The answer lives in the **routing table**, and reading one fluently is a core CCNA skill.

## The routing table

Every router keeps a table of **routes**: destination networks paired with instructions for reaching them.

```term
R1# show ip route
Codes: L - local, C - connected, S - static, O - OSPF, * - candidate default

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
C     10.1.1.0/24 is directly connected, GigabitEthernet0/0
L     10.1.1.1/32 is directly connected, GigabitEthernet0/0
O     10.1.2.0/24 [110/2] via 10.1.12.2, 00:14:02, GigabitEthernet0/1
S     172.16.0.0/16 [1/0] via 10.1.12.2
```

Route sources you'll see constantly:

- **C (connected)** — networks on the router's own interfaces. Free, automatic.
- **L (local)** — the router's own interface IP as a /32.
- **S (static)** — routes an admin typed in.
- **O (OSPF)** — learned dynamically from neighbors.
- **S\* 0.0.0.0/0** — the **default route**: "everything I don't otherwise know."

## Longest prefix match — the golden rule

When multiple routes cover a destination, the router picks the **most specific** one (longest prefix). Destination `10.1.2.77` matching against:

- `0.0.0.0/0` — matches (0 bits specific)
- `10.0.0.0/8` — matches (8 bits)
- `10.1.2.0/24` — matches (24 bits) ← **winner**

```callout
{ "type": "exam", "body": "Longest prefix match beats EVERYTHING — including administrative distance and metric. AD and metric only break ties between routes to the SAME prefix. Order of evaluation: longest prefix → lowest AD → lowest metric." }
```

## Administrative distance — trusting your sources

Two protocols offer the *same* prefix? The router believes the source with the lowest **administrative distance (AD)**:

| Source | AD |
|---|---|
| Connected | 0 |
| Static | 1 |
| eBGP | 20 |
| EIGRP | 90 |
| OSPF | 110 |
| RIP | 120 |

The `[110/2]` in the table above reads: **[AD / metric]** — an OSPF route (110) with cost 2.

```sort
{ "prompt": "Order these route sources from MOST trusted (lowest AD) to least", "items": ["Connected (0)", "Static (1)", "eBGP (20)", "EIGRP (90)", "OSPF (110)", "RIP (120)"] }
```

## The full forwarding decision

```diagram
{ "type": "flow", "title": "What a router does with each packet", "steps": [ { "label": "Receive frame", "detail": "Strip L2, check the IP packet & TTL" }, { "label": "Longest prefix match", "detail": "Find the most specific route for the destination" }, { "label": "Resolve next hop", "detail": "Which neighbor / exit interface (ARP if needed)" }, { "label": "Rewrite & forward", "detail": "New frame, decremented TTL, off it goes" } ] }
```

No match at all — not even a default route? The packet is **dropped** and an ICMP "destination unreachable" goes back. Routers don't flood like switches; they either know or refuse.

```flip
{ "title": "Routing table reading drill", "cards": [ { "front": "In [110/2], what is 110? What is 2?", "back": "AD = 110 (OSPF), metric = 2 (cost)" }, { "front": "Which route wins for 10.1.2.5: 10.1.0.0/16 (AD 1) or 10.1.2.0/24 (AD 110)?", "back": "10.1.2.0/24 — longest prefix beats lower AD" }, { "front": "S* 0.0.0.0/0 means…", "back": "A static default route — the path of last resort" }, { "front": "What creates 'C' routes?", "back": "Configuring an IP on an interface that is up/up" } ] }
```

```quiz
{ "question": "R1 has routes 172.16.0.0/16 via A (AD 90), 172.16.8.0/24 via B (AD 110), and 0.0.0.0/0 via C. Where does a packet for 172.16.8.55 go?", "options": ["Via A — lowest AD wins", "Via B — /24 is the longest matching prefix", "Via C — default routes take priority", "It is load-balanced across A and B"], "answer": 1, "explanation": "Longest prefix match runs FIRST: /24 (via B) is more specific than /16 or /0, so B wins even though its AD (110) is worse than A's (90). AD only compares routes to the identical prefix." }
```
