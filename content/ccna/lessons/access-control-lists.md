An **ACL (Access Control List)** is a router's traffic filter: an ordered list of permit/deny rules applied to packets. ACLs enforce policy ("guests can't reach servers"), protect management planes, and select traffic for NAT and VPNs. They're also the exam's favorite thing to make you debug.

## How ACLs think

Three laws govern every ACL:

1. **Top-down, first match wins** — rules are evaluated in order; the first matching line decides, and evaluation stops.
2. **Implicit deny all** — an invisible `deny any` ends every ACL. Traffic matching nothing is dropped.
3. **One ACL per interface, per direction, per protocol** — applied **inbound** or **outbound**.

```callout
{ "type": "warning", "body": "Law 1 + Law 2 cause most ACL bugs. Put a broad permit above a specific deny and the deny never fires. Forget any permit and the implicit deny eats ALL traffic — including your OSPF hellos and your own SSH session." }
```

## Wildcard masks again

ACLs match ranges with wildcard masks (0 = must match, 1 = don't care) — same arithmetic as OSPF:

- `10.1.1.0 0.0.0.255` → the 10.1.1.0/24 subnet
- `host 10.1.1.5` → exactly one address (= `10.1.1.5 0.0.0.0`)
- `any` → everything (= `0.0.0.0 255.255.255.255`)

## Standard vs extended

```diagram
{ "type": "compare", "title": "Standard vs Extended ACLs", "left": { "title": "Standard (1–99)", "items": ["Matches SOURCE address only", "Coarse — all traffic from X", "Place CLOSE TO THE DESTINATION", "access-list 10 permit 10.1.1.0 0.0.0.255"] }, "right": { "title": "Extended (100–199)", "items": ["Matches source + dest + protocol + PORTS", "Surgical — 'TCP from A to B port 443'", "Place CLOSE TO THE SOURCE", "permit tcp 10.1.1.0 0.0.0.255 host 10.9.9.9 eq 443"] } }
```

The placement rule's logic: standard ACLs are blunt — applied near the source they'd kill traffic to *everything*, so they sit near the destination. Extended ACLs identify traffic precisely — filter it near the source and don't waste bandwidth carrying doomed packets.

## Named ACLs — the modern syntax

```term
R1(config)# ip access-list extended BLOCK-GUEST-TO-SERVERS
R1(config-ext-nacl)# deny ip 10.30.0.0 0.0.255.255 10.99.0.0 0.0.0.255
R1(config-ext-nacl)# permit ip any any
R1(config)# interface gi0/1
R1(config-if)# ip access-group BLOCK-GUEST-TO-SERVERS in
```

Named ACLs allow **editing by sequence number** (`no 20`, `15 permit ...`) instead of rewriting the list — always prefer them.

Note the essential final line: **`permit ip any any`** — without it, the implicit deny blocks everything else too.

```sort
{ "prompt": "Order these lines so the ACL blocks ONLY guest→server traffic (top-down!)", "items": ["deny ip 10.30.0.0 0.0.255.255 10.99.0.0 0.0.0.255", "permit ip any any"] }
```

## Protecting the VTY lines

A special ACL application — restricting who may SSH to the device at all:

```term
R1(config)# access-list 5 permit 10.99.1.0 0.0.0.255
R1(config)# line vty 0 4
R1(config-line)# access-class 5 in
```

`access-class` (not `access-group`) on lines — a subtle keyword difference the exam probes.

```match
{ "prompt": "Match the ACL element to its meaning", "pairs": [ { "left": "Implicit deny", "right": "Unmatched traffic is dropped at the end" }, { "left": "host 10.1.1.5", "right": "Wildcard shorthand for exactly one IP" }, { "left": "access-class", "right": "Applies an ACL to VTY lines" }, { "left": "eq 443", "right": "Matches the HTTPS port in extended ACLs" } ] }
```

```quiz
{ "question": "An ACL reads: 10: permit ip 10.0.0.0 0.255.255.255 any / 20: deny tcp host 10.1.1.5 any eq 23. Does host 10.1.1.5 reach Telnet servers?", "options": ["No — line 20 explicitly denies it", "Yes — line 10 matches first and permits everything from 10.x, so line 20 never evaluates", "No — the implicit deny blocks it", "Only if the ACL is applied outbound"], "answer": 1, "explanation": "Top-down, first match wins: 10.1.1.5 falls inside 10.0.0.0/8, so line 10 permits it and processing stops. The specific deny is unreachable — it must be moved ABOVE the broad permit to take effect." }
```
