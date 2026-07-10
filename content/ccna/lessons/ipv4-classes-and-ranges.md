Before masks were flexible, IPv4 was carved into rigid **classes** — and although classless addressing (CIDR) replaced them decades ago, class vocabulary and the **special ranges** born in that era are permanent exam material and daily engineering language.

## The classful system (historical, still quizzed)

The first bits of an address determined its class and its *default* mask:

| Class | First octet | Default mask | Purpose |
|---|---|---|---|
| A | 1–126 | /8 (255.0.0.0) | Huge networks — 16M hosts |
| B | 128–191 | /16 (255.255.0.0) | Medium — 65K hosts |
| C | 192–223 | /24 (255.255.255.0) | Small — 254 hosts |
| D | 224–239 | — | **Multicast** (not host addressing) |
| E | 240–255 | — | Experimental |

Notice 127 is missing from Class A — that whole block is **loopback** (see below).

```flip
{ "title": "Class first-octet drill", "cards": [ { "front": "10.50.1.1 — which class?", "back": "Class A (1–126), default /8" }, { "front": "172.20.4.9 — which class?", "back": "Class B (128–191), default /16" }, { "front": "200.15.7.3 — which class?", "back": "Class C (192–223), default /24" }, { "front": "224.0.0.5 — which class?", "back": "Class D — multicast (OSPF uses this one!)" } ] }
```

## Private addresses — RFC 1918

Three ranges are reserved for **private** use — free for anyone inside their own network, but **not routable on the public Internet**:

- `10.0.0.0/8` — 10.x.x.x (one giant block)
- `172.16.0.0/12` — 172.16.x.x through 172.**31**.x.x (the /12 trips people up)
- `192.168.0.0/16` — 192.168.x.x

Nearly every LAN you'll touch uses these, with **NAT** (later module) translating to public addresses at the Internet edge.

```callout
{ "type": "exam", "body": "Memorize the exact private boundaries — especially that 172.16–172.31 is private but 172.32.x.x is PUBLIC. 'Which of these addresses is private?' with 172.33.1.1 as a trap is a classic." }
```

## Special addresses you must recognize

- **127.0.0.0/8 — loopback.** `127.0.0.1` = "this machine." Ping it to test your own IP stack.
- **169.254.0.0/16 — APIPA / link-local.** A host that *failed to reach DHCP* self-assigns here. Seeing 169.254.x.x on a PC = diagnose DHCP.
- **Network address** — host bits all 0 (`192.168.1.0/24`): names the subnet itself, unusable for hosts.
- **Broadcast address** — host bits all 1 (`192.168.1.255/24`): reaches every host on the subnet, unusable for hosts.
- **0.0.0.0/0** — "any network"; as a route it's the **default route**.

```match
{ "prompt": "A PC shows each address below — match it to the diagnosis", "pairs": [ { "left": "169.254.20.7", "right": "DHCP failed — self-assigned APIPA" }, { "left": "127.0.0.1", "right": "Loopback — testing its own stack" }, { "left": "10.4.2.99", "right": "Normal RFC 1918 private address" }, { "left": "8.8.8.8", "right": "Public, Internet-routable address" } ] }
```

## Why classes died: CIDR

Rigid classes wasted addresses catastrophically (need 1000 hosts? Class B gives 65K — 98% wasted). **CIDR (Classless Inter-Domain Routing)** decoupled the mask from the first octet: any prefix length on any address. That freedom is exactly what the next lessons teach you to wield.

```quiz
{ "question": "A user reports no connectivity. ipconfig shows 169.254.113.5. What happened?", "options": ["The PC has a public address and is fine", "The PC couldn't reach a DHCP server and self-assigned an APIPA address", "The PC is using a private RFC 1918 address", "Someone set a static loopback"], "answer": 1, "explanation": "169.254.0.0/16 is the self-assigned (APIPA) range — the OS falls back to it when DHCP fails. Check the DHCP server, the VLAN, or the cable path to it." }
```
