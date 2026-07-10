"Network" can mean the two devices on your desk or the planet-wide mesh of the Internet. We classify networks by **geographic scope**, because scope changes everything: who owns the links, how fast they are, and what technologies make sense.

## The big four

- **LAN (Local Area Network)** — one location: a home, office floor, or building. You own the equipment. High speed (1–100 Gbps), low delay. Built with Ethernet switches and Wi-Fi.
- **WAN (Wide Area Network)** — connects LANs across cities, countries, continents. You usually *lease* connectivity from a **service provider** (ISP). Slower and costlier per bit than LAN links.
- **MAN (Metropolitan Area Network)** — city-scale, between LAN and WAN; think a university with campuses across town.
- **PAN (Personal Area Network)** — your personal bubble: Bluetooth earbuds, smartwatch, phone hotspot.

```diagram
{ "type": "layers", "title": "Network types by reach (smallest to largest)", "layers": [ { "label": "PAN", "detail": "Bluetooth, ~10 m — your personal devices", "badge": "1" }, { "label": "LAN", "detail": "A home, office, or building — you own it", "badge": "2" }, { "label": "MAN", "detail": "A city or campus spanning sites", "badge": "3" }, { "label": "WAN", "detail": "Countries and continents — provider-operated", "badge": "4" } ] }
```

## LAN vs WAN — the distinction that matters

For the CCNA (and real jobs), LAN vs WAN is the split you'll use daily:

| | LAN | WAN |
|---|---|---|
| **Scope** | Single site | Multiple sites / global |
| **Ownership** | Your organization | Leased from providers |
| **Speed** | Very high (1–100 Gbps) | Varies; typically lower |
| **Technologies** | Ethernet, Wi-Fi | MPLS, VPN over Internet, dedicated lines |
| **Cost model** | Buy hardware once | Pay monthly for circuits |

```callout
{ "type": "tip", "body": "Quick test: if the traffic leaves the building over a link you pay a provider for, it's crossing a WAN. If it stays on switches you own, it's LAN." }
```

## The Internet — a network of networks

The **Internet** is the ultimate WAN: millions of independent networks agreeing to interconnect. Your home LAN reaches it through an ISP; enterprises connect through one or more ISPs, often with redundant links. Two related terms you'll meet constantly:

- **Intranet** — an organization's *private* internal network and services (only employees reach it).
- **Extranet** — a controlled slice of your network exposed to *partners* (suppliers checking inventory, for example).

```match
{ "prompt": "Match the term to its definition", "pairs": [ { "left": "Internet", "right": "Global public network of networks" }, { "left": "Intranet", "right": "Private network for an organization's own users" }, { "left": "Extranet", "right": "Controlled access for external partners" }, { "left": "WAN", "right": "Connects sites across large distances" } ] }
```

## Where you fit in

As a network engineer you'll mostly **build LANs** (switching, Wi-Fi, addressing) and **connect them over WANs** (routing, VPNs, provider circuits). That's exactly the arc of this course.

```quiz
{ "question": "A company has offices in Delhi and Mumbai, each with its own switched network, connected via a leased provider circuit. What best describes the overall setup?", "options": ["Two WANs connected by a LAN", "Two LANs connected by a WAN link", "One large MAN", "A peer-to-peer PAN"], "answer": 1, "explanation": "Each office network is a LAN (single site, self-owned). The provider circuit joining the cities is a WAN link. LANs at the edges, WAN in the middle — the classic enterprise pattern." }
```
