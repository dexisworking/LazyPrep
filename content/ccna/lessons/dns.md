You typed `lazyprep.dev`, but packets need `76.76.21.21`. The **Domain Name System (DNS)** performs that translation billions of times a second, planet-wide, using a distributed database so elegant it's basically infrastructure poetry. When DNS breaks, users say "the Internet is down."

## The resolution journey

Your machine asks its configured **recursive resolver** (ISP's, or 8.8.8.8 / 1.1.1.1). If the resolver doesn't know, it walks the hierarchy:

```diagram
{ "type": "flow", "title": "Resolving www.example.com", "steps": [ { "label": "Stub → Resolver", "detail": "\"What's www.example.com?\" (checks local cache first)" }, { "label": "Resolver → Root server", "detail": "\"Ask the .com servers — here's where\"" }, { "label": "Resolver → .com TLD", "detail": "\"example.com's nameservers are here\"" }, { "label": "Resolver → Authoritative NS", "detail": "\"www.example.com = 93.184.216.34\" ✓" }, { "label": "Answer cached & returned", "detail": "TTL controls how long everyone remembers" } ] }
```

The resolver does the legwork (**recursive** query); the servers it visits each answer just their part (**iterative** responses). Caching at every hop — OS, resolver, browser — is why most lookups never leave your machine.

## Record types

| Record | Maps | Example |
|---|---|---|
| **A** | name → IPv4 | example.com → 93.184.216.34 |
| **AAAA** | name → IPv6 | example.com → 2606:2800:… |
| **CNAME** | name → another name | www → example.com |
| **MX** | domain → mail servers | example.com → mail.example.com |
| **PTR** | IP → name (reverse) | 34.216.184.93.in-addr.arpa |
| **NS** | domain → its nameservers | example.com → ns1.example.com |

```match
{ "prompt": "Match the DNS record to its job", "pairs": [ { "left": "A", "right": "Hostname to IPv4 address" }, { "left": "AAAA", "right": "Hostname to IPv6 address" }, { "left": "MX", "right": "Where a domain's email goes" }, { "left": "CNAME", "right": "Alias pointing to another name" }, { "left": "PTR", "right": "Reverse lookup — IP to name" } ] }
```

## Transport quirks (exam bait)

DNS queries ride **UDP port 53** — small and fast. But DNS uses **TCP 53** for zone transfers between servers and for responses too large for UDP. "DNS uses UDP" is true-but-incomplete; the exam knows the difference.

## DNS on Cisco devices

Routers and switches resolve names too (for your convenience at the CLI):

```term
R1(config)# ip name-server 8.8.8.8
R1(config)# ip domain lookup
R1(config)# ip domain name corp.local
R1# ping www.cisco.com
Translating "www.cisco.com"...domain server (8.8.8.8) [OK]
```

```callout
{ "type": "tip", "body": "Classic Cisco CLI pain: mistype a command and the router tries to RESOLVE it as a hostname, hanging for a minute. 'no ip domain lookup' disables that on lab boxes — one of the most-typed convenience commands in Cisco history." }
```

## Troubleshooting with nslookup

`ping fails but the site works for others` → test name resolution directly:

```term
C:\> nslookup www.example.com
Server:  dns.google
Address:  8.8.8.8
Name:    www.example.com
Address:  93.184.216.34
```

Resolution works but ping fails → routing/firewall problem. Resolution fails → DNS problem. That one fork saves hours.

```quiz
{ "question": "Users can reach servers by IP address but not by hostname. Which service should you investigate first?", "options": ["DHCP", "DNS", "NAT", "STP"], "answer": 1, "explanation": "IP connectivity works (pings by address succeed), so routing and switching are fine. Names failing while IPs work is the textbook signature of a DNS problem — wrong resolver configured, resolver down, or records missing." }
```
