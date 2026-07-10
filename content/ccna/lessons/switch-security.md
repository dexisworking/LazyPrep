Firewalls guard the perimeter — but the attacker who plugs into a lobby Ethernet jack is already inside. Layer 2 has its own attack surface and its own defenses. Three switch features form the CCNA's LAN-security trinity: **port security**, **DHCP snooping**, and **Dynamic ARP Inspection**.

## Port security — controlling who plugs in

Limits which and how many MAC addresses may use a switch port:

```term
SW1(config)# interface gi0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation shutdown
```

- **maximum** — how many MACs allowed (2 fits a phone + PC daisy chain).
- **sticky** — learn the current MAC(s) and write them into the config.
- **violation modes**: **shutdown** (default — err-disable the port), **restrict** (drop + log + counter), **protect** (drop silently).

This blunts MAC flooding attacks (an attacker generating thousands of MACs to overflow the CAM table and force the switch to flood like a hub) and casual rogue devices.

```term
SW1# show port-security interface gi0/5
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Last Source Address:Vlan   : 000c.2911.f0a2:1
```

Recovering an err-disabled port: fix the cause, then `shutdown` / `no shutdown` (or configure `errdisable recovery`).

```callout
{ "type": "exam", "body": "Violation-mode behavior is a guaranteed question: shutdown err-disables the port; restrict drops AND logs/increments the counter; protect drops SILENTLY. Also know that sticky MACs survive in running-config (save to keep them)." }
```

## DHCP snooping — no rogue servers

A rogue DHCP server (malicious or a helpful employee's home router) can hand clients a poisoned gateway — instant MITM. **DHCP snooping** divides ports into:

- **Untrusted** (default, host-facing) — DHCP **server** messages (OFFER/ACK) arriving here are dropped.
- **Trusted** (uplinks toward the real server) — server messages allowed.

```term
SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# interface gi0/24
SW1(config-if)# ip dhcp snooping trust
```

Bonus: snooping builds a **binding table** (MAC ↔ IP ↔ port ↔ VLAN from observed leases) — the database the next feature relies on.

## Dynamic ARP Inspection — no gateway impersonation

**DAI** validates ARP packets on untrusted ports against the DHCP snooping binding table. An attacker claiming "10.1.1.1 (the gateway) is at MY MAC" gets dropped, because the binding table knows better. ARP spoofing — the LAN MITM classic — dies here.

```term
SW1(config)# ip arp inspection vlan 10
SW1(config)# interface gi0/24
SW1(config-if)# ip arp inspection trust
```

```diagram
{ "type": "flow", "title": "The L2 defense chain", "steps": [ { "label": "Port security", "detail": "Limits MACs per port — stops CAM flooding" }, { "label": "DHCP snooping", "detail": "Blocks rogue servers; builds the binding table" }, { "label": "DAI", "detail": "Uses that table to kill ARP spoofing" } ] }
```

```match
{ "prompt": "Match the attack to the defense that stops it", "pairs": [ { "left": "CAM table flooding", "right": "Port security (max MACs)" }, { "left": "Rogue DHCP server", "right": "DHCP snooping (untrusted ports)" }, { "left": "ARP spoofing / MITM", "right": "Dynamic ARP Inspection" }, { "left": "Rogue switch negotiating a trunk", "right": "Disable DTP + BPDU Guard" } ] }
```

```quiz
{ "question": "After enabling DHCP snooping on VLAN 10, clients suddenly can't get IP addresses. The real DHCP server connects via uplink gi0/24. What's missing?", "options": ["'ip dhcp snooping trust' on gi0/24", "An ip helper-address on the switch", "Port security on gi0/24", "Nothing — snooping always breaks DHCP"], "answer": 0, "explanation": "All ports default to UNTRUSTED, which drops server-originated DHCP messages — including the legitimate server's OFFERs arriving on the uplink. Marking the uplink trusted lets real leases flow while still blocking rogue servers on access ports." }
```
