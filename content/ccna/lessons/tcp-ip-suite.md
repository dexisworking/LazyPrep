The OSI model is the textbook; **TCP/IP is the running code**. The Internet — and every network you'll ever configure — is built on the TCP/IP protocol suite. It has its own, leaner layer model, and knowing how it maps to OSI lets you speak both dialects.

## Four layers instead of seven

```diagram
{ "type": "layers", "title": "The TCP/IP model", "layers": [ { "label": "Application", "detail": "HTTP, DNS, DHCP, SSH — merges OSI 5–7", "badge": "4" }, { "label": "Transport", "detail": "TCP, UDP — same as OSI L4", "badge": "3" }, { "label": "Internet", "detail": "IPv4, IPv6, ICMP — same as OSI L3", "badge": "2" }, { "label": "Network Access", "detail": "Ethernet, Wi-Fi — merges OSI 1–2", "badge": "1" } ] }
```

The mapping to remember:

| TCP/IP layer | OSI equivalent | Star protocols |
|---|---|---|
| Application | 7 + 6 + 5 | HTTP, HTTPS, DNS, DHCP, SSH, SMTP |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IPv4, IPv6, ICMP |
| Network Access | 2 + 1 | Ethernet, 802.11 Wi-Fi |

```callout
{ "type": "info", "body": "Confusingly, everyone still says 'Layer 2 problem' or 'Layer 3 switch' using OSI numbers, even while running TCP/IP. Learn TCP/IP's grouping, but keep OSI numbering for conversation — that's the industry habit." }
```

## The protocols that run your day

A few Application-layer protocols carry most of the Internet:

- **HTTP/HTTPS** — the web (HTTPS = HTTP inside TLS encryption).
- **DNS** — turns names (`netprep.dev`) into IP addresses.
- **DHCP** — hands devices their IP configuration automatically.
- **SSH** — secure remote login (how you'll manage switches and routers).
- **SMTP/IMAP** — email moving and reading.

Each gets a deep-dive lesson later; for now, know which layer they call home.

```match
{ "prompt": "Match the protocol to its job", "pairs": [ { "left": "DNS", "right": "Resolves names to IP addresses" }, { "left": "DHCP", "right": "Assigns IP settings automatically" }, { "left": "SSH", "right": "Encrypted remote device management" }, { "left": "ICMP", "right": "Diagnostics — ping and traceroute" } ] }
```

## Why TCP/IP won

OSI was designed by committee as a *reference*; TCP/IP was working software first (ARPANET, 1970s–80s) that got refined by use. When the Internet exploded, the running code became the standard. The OSI model survived as the shared vocabulary — the best of both.

## One request, both models

Loading `https://example.com` exercises the whole suite at once:

```diagram
{ "type": "flow", "title": "One page load through TCP/IP", "steps": [ { "label": "DNS", "detail": "Resolve example.com → 93.184.216.34" }, { "label": "TCP", "detail": "Three-way handshake to port 443" }, { "label": "TLS", "detail": "Negotiate encryption keys" }, { "label": "HTTP", "detail": "GET / — server responds with the page" } ] }
```

```quiz
{ "question": "In the TCP/IP model, which single layer covers what OSI splits into Application, Presentation, and Session?", "options": ["Transport", "Internet", "Application", "Network Access"], "answer": 2, "explanation": "TCP/IP's Application layer absorbs OSI layers 5, 6, and 7. Similarly, Network Access absorbs OSI 1 and 2. The middle layers (Transport, Internet/Network) map one-to-one." }
```
