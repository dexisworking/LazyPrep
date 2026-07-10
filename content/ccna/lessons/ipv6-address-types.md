Every IPv6 interface juggles **several addresses at once** — that's normal and by design. Knowing the address types on sight (by their prefixes) and how hosts acquire them automatically is the heart of CCNA IPv6.

## The address types you must recognize

```diagram
{ "type": "layers", "title": "IPv6 address types by prefix", "layers": [ { "label": "Global Unicast (GUA)", "detail": "2000::/3 — public, Internet-routable (starts 2 or 3)", "badge": "🌍" }, { "label": "Unique Local (ULA)", "detail": "fc00::/7 — private, like RFC 1918 (starts fd)", "badge": "🏠" }, { "label": "Link-Local (LLA)", "detail": "fe80::/10 — every interface has one; never routed", "badge": "🔗" }, { "label": "Multicast", "detail": "ff00::/8 — groups (ff02::1 all nodes, ff02::2 all routers)", "badge": "📢" } ] }
```

- **GUA** — the public address; globally unique, routable anywhere.
- **ULA** — private internal addressing; won't route on the Internet.
- **Link-local** — automatic on every IPv6 interface, valid only on its own link. Routing protocols (OSPFv3!) and next-hop addresses use link-locals constantly.
- **Anycast** — same address on multiple devices; traffic reaches the *nearest* one. No special prefix — it's a unicast address used in multiple places.

```match
{ "prompt": "Match the address to its type", "pairs": [ { "left": "2001:db8:12::7", "right": "Global unicast (2000::/3)" }, { "left": "fe80::1c2f:abff:fe33:901", "right": "Link-local (fe80::/10)" }, { "left": "fd00:abc::10", "right": "Unique local — private (fc00::/7)" }, { "left": "ff02::2", "right": "Multicast — all routers on link" } ] }
```

## EUI-64 — an address from your MAC

Hosts can build their own 64-bit interface ID from their 48-bit MAC:

```diagram
{ "type": "flow", "title": "EUI-64: MAC 50:3e:aa:12:34:56 → interface ID", "steps": [ { "label": "Split the MAC in half", "detail": "50:3e:aa | 12:34:56" }, { "label": "Insert fffe in the middle", "detail": "50:3e:aa:ff:fe:12:34:56" }, { "label": "Flip the 7th bit of byte 1", "detail": "50 (01010000) → 52 (01010010)" }, { "label": "Result", "detail": "Interface ID 523e:aaff:fe12:3456" } ] }
```

Spot `ff:fe` in the middle of an interface ID and you're looking at EUI-64. (Privacy extensions randomize IDs instead, precisely because EUI-64 leaks your hardware identity.)

## SLAAC — configuration without a server

**Stateless Address Autoconfiguration** lets a host address itself with zero servers:

1. Host self-assigns its **link-local** (fe80::…) address.
2. Sends a **Router Solicitation (RS)** — "any routers here?"
3. Router answers with a **Router Advertisement (RA)** — "the prefix here is 2001:db8:acad:1::/64, I'm your gateway."
4. Host appends its interface ID (EUI-64 or random) to the prefix → done. **DAD** (Duplicate Address Detection) confirms uniqueness.

DHCPv6 still exists (stateful, or stateless just for DNS options), but SLAAC is IPv6's signature move.

```callout
{ "type": "exam", "body": "SLAAC uses RS/RA messages, which belong to NDP (Neighbor Discovery Protocol) over ICMPv6. NDP's Neighbor Solicitation/Advertisement also REPLACES ARP for IPv6 — expect at least one question mapping NDP messages to their IPv4 ancestors." }
```

## NDP — ARP's successor

| Job | IPv4 way | IPv6 way |
|---|---|---|
| Find a neighbor's MAC | ARP (broadcast) | **Neighbor Solicitation** (solicited-node multicast) |
| Answer | ARP reply | **Neighbor Advertisement** |
| Find routers | — (DHCP option) | **RS / RA** |
| Detect duplicate address | Gratuitous ARP | **DAD** |

```quiz
{ "question": "An interface reports: fe80::5054:ff:fe12:3456 and 2001:db8:1::10. A colleague says something is misconfigured. Are they right?", "options": ["Yes — an interface can hold only one IPv6 address", "Yes — fe80:: addresses indicate DHCP failure like APIPA", "No — every interface has a link-local PLUS any global addresses; this is normal", "No — but the fe80 address should be removed manually"], "answer": 2, "explanation": "Multiple addresses per interface is standard IPv6: the link-local (fe80::/10) is mandatory and automatic, coexisting with global unicast addresses. Unlike IPv4's APIPA, a link-local is not a failure symptom." }
```
