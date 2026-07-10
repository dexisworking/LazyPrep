Every host has exactly one default gateway address. If the router owning it dies, the entire subnet loses the outside world — even if a perfectly healthy second router sits right beside it. **First Hop Redundancy Protocols (FHRPs)** make two routers share one gateway identity, so failure becomes invisible.

## The trick: a virtual gateway

Two routers agree on a **virtual IP** (VIP) and **virtual MAC**. Hosts point at the VIP. One router (the **Active**) answers to it; the other (**Standby**) watches via hellos. Active dies → Standby claims the virtual identity — hosts notice nothing. Their ARP entry (VIP → virtual MAC) never changes.

```diagram
{ "type": "flow", "title": "HSRP failover, from the host's view", "steps": [ { "label": "Normal", "detail": "Hosts → VIP 10.1.1.1 → Active router R1" }, { "label": "R1 fails", "detail": "Standby R2 stops hearing hellos (~10 s, tunable to sub-second)" }, { "label": "Takeover", "detail": "R2 assumes VIP + virtual MAC, sends gratuitous ARP" }, { "label": "After", "detail": "Hosts still → 10.1.1.1 — nothing changed for them" } ] }
```

## The three protocols

| | HSRP | VRRP | GLBP |
|---|---|---|---|
| Origin | Cisco | **Open standard** | Cisco |
| Roles | Active / Standby | Master / Backup | AVG + AVFs |
| Load balancing | No (one active) | No | **Yes — per-host** |
| Exam weight | Highest | Know it exists | Know its trick |

- **HSRP (Hot Standby Router Protocol)** — the Cisco classic the exam drills. Highest **priority** (default 100) wins Active; tie → highest interface IP. **Preemption is OFF by default** — a recovered high-priority router won't take back the Active role unless `standby preempt` is configured.
- **VRRP** — functionally HSRP's open-standard sibling (preemption on by default).
- **GLBP** — adds **load balancing**: one AVG hands out *different* virtual MACs to different hosts, spreading traffic across multiple forwarders simultaneously.

## Minimal HSRP config

```term
R1(config)# interface gi0/0
R1(config-if)# ip address 10.1.1.2 255.255.255.0
R1(config-if)# standby 1 ip 10.1.1.1
R1(config-if)# standby 1 priority 110
R1(config-if)# standby 1 preempt
!
R2(config)# interface gi0/0
R2(config-if)# ip address 10.1.1.3 255.255.255.0
R2(config-if)# standby 1 ip 10.1.1.1
```

Hosts use gateway `10.1.1.1` — an address **neither router physically owns**.

```term
R1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           10.1.1.3        10.1.1.1
```

```callout
{ "type": "exam", "body": "HSRP details to memorize: virtual MAC pattern 0000.0c07.acXX (XX = group number in hex), multicast 224.0.0.2 (v1), priority default 100 / highest wins, preemption off by default. 'Router with higher priority came online but didn't take over' → missing 'standby preempt'." }
```

```match
{ "prompt": "Match the FHRP to its signature", "pairs": [ { "left": "HSRP", "right": "Cisco Active/Standby, exam favorite" }, { "left": "VRRP", "right": "Open-standard Master/Backup" }, { "left": "GLBP", "right": "Load-balances across gateways per host" } ] }
```

```quiz
{ "question": "In an HSRP pair, R1 (priority 110, preempt) is Active. R1 reboots; R2 takes over. What happens when R1 finishes booting?", "options": ["R2 stays Active forever — first claim wins", "R1 reclaims Active because preemption is configured", "They load-balance the VIP", "Hosts must renew DHCP to follow R1"], "answer": 1, "explanation": "With 'standby preempt' configured and the higher priority (110 > 100), R1 takes the Active role back on recovery. Without preempt, R2 would have kept it despite the lower priority — the classic gotcha." }
```
