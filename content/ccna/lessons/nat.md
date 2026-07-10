Your office runs on private 10.x addresses that the Internet refuses to route. Yet every laptop browses fine. The magician is **NAT (Network Address Translation)** — rewriting addresses at the network edge, and single-handedly keeping IPv4 alive decades past its expiry date.

## The vocabulary (learn it or suffer)

Cisco's four NAT terms confuse everyone once, then click:

- **Inside local** — a host's private address, seen inside (10.1.1.50).
- **Inside global** — the same host's public face, after translation (203.0.113.10).
- **Outside global** — an external destination's public address (8.8.8.8).
- Trick: **inside/outside = who owns the address; local/global = where you're standing when you look**.

```match
{ "prompt": "Your PC 10.1.1.50 is NAT'd to 203.0.113.10 while browsing 8.8.8.8. Match the terms", "pairs": [ { "left": "Inside local", "right": "10.1.1.50 — private address of your PC" }, { "left": "Inside global", "right": "203.0.113.10 — your PC as the Internet sees it" }, { "left": "Outside global", "right": "8.8.8.8 — the external server" } ] }
```

## Three flavors of NAT

**Static NAT** — one private ↔ one public, permanent. For servers that must be reachable *from* the Internet:

```term
R1(config)# ip nat inside source static 10.1.1.100 203.0.113.5
```

**Dynamic NAT** — a pool of public addresses handed out first-come-first-served. Pool empty → next host waits. Rare in practice.

**PAT (Port Address Translation / NAT overload)** — the one that runs the world. *Thousands* of hosts share **one** public IP, distinguished by translated **source ports**:

```diagram
{ "type": "flow", "title": "PAT: many hosts, one public IP", "steps": [ { "label": "10.1.1.50:52001 → web", "detail": "Rewritten to 203.0.113.1:62001" }, { "label": "10.1.1.51:52001 → web", "detail": "Rewritten to 203.0.113.1:62002 — port disambiguates!" }, { "label": "Replies return", "detail": "Router reverses the mapping from its translation table" } ] }
```

## Configuring PAT (the full recipe)

```term
R1(config)# interface gi0/1
R1(config-if)# ip nat inside
R1(config)# interface gi0/0
R1(config-if)# ip nat outside
R1(config)# access-list 1 permit 10.1.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface gi0/0 overload
```

Four ingredients — miss any and NAT silently fails:

1. Mark the **inside** interface(s).
2. Mark the **outside** interface.
3. An ACL defining *which* source addresses translate.
4. The `overload` keyword = PAT on the outside interface's IP.

Verify:

```term
R1# show ip nat translations
Pro  Inside global        Inside local       Outside local      Outside global
tcp  203.0.113.1:62001    10.1.1.50:52001    93.184.216.34:443  93.184.216.34:443
```

```callout
{ "type": "exam", "body": "Given a NAT config with a missing piece — no 'ip nat inside' on an interface, wrong ACL, or missing 'overload' — identify why translation fails. Also: 'many hosts, one public IP' ALWAYS means PAT/overload." }
```

## NAT's true cost

NAT breaks the end-to-end principle: outside hosts can't initiate connections in (usually a feature; sometimes a fight — VoIP, gaming, P2P all need workarounds). And note carefully: **NAT is not security** — it hides topology, but a firewall does the protecting. IPv6's vastness eliminates the *need* for NAT; until then, PAT is the Internet's duct tape.

```quiz
{ "question": "A small office has 60 devices and ONE public IP from its ISP. Which NAT type makes this work?", "options": ["Static NAT — 60 static mappings", "Dynamic NAT with a 60-address pool", "PAT (overload) — port numbers multiplex one IP", "NAT can't share a single address"], "answer": 2, "explanation": "PAT translates each session to a unique source port on the single public IP, supporting thousands of simultaneous flows. Static needs one public IP per host; dynamic needs a pool as large as concurrent users." }
```
