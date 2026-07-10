STP blocks redundant links — safe, but wasteful: you paid for two 1 Gbps links and get to use one. **EtherChannel** solves this by convincing STP that several physical links are *one logical link*, so all of them forward at once.

## What EtherChannel does

Bundle 2–8 physical links between two switches into a single logical interface (a **port-channel**):

- **All links forward simultaneously** — no STP blocking inside the bundle (STP sees one link).
- **Load balancing** spreads flows across members (hash of MACs/IPs/ports — one *flow* always sticks to one link, preserving frame order).
- **Failover is instant** — lose one member and traffic redistributes with no STP reconvergence.

```diagram
{ "type": "compare", "title": "Without vs with EtherChannel", "left": { "title": "Two parallel links, no bundle", "items": ["STP blocks one link", "Half the bandwidth idle", "Failover = STP reconvergence"] }, "right": { "title": "Two links, one port-channel", "items": ["STP sees ONE logical link", "Both links carry traffic", "Member failure = instant rebalance"] } }
```

## Negotiation protocols: LACP vs PAgP

Bundles can be negotiated, and the exam loves the mode matrix:

- **LACP (802.3ad)** — the open standard. Modes: **active** (initiates) and **passive** (responds). Bundle forms if at least one side is active.
- **PAgP** — Cisco-proprietary. Modes: **desirable** (initiates) and **auto** (responds). Same logic: desirable+desirable or desirable+auto works.
- **Static (`mode on`)** — no negotiation at all; both sides must be `on`. Mixing `on` with a negotiating mode fails.

```match
{ "prompt": "Will the bundle form? Match the mode pairs to the outcome", "pairs": [ { "left": "active + passive", "right": "Forms (LACP)" }, { "left": "passive + passive", "right": "Fails — nobody initiates" }, { "left": "desirable + auto", "right": "Forms (PAgP)" }, { "left": "on + active", "right": "Fails — static can't negotiate" } ] }
```

## Configuration

Settings must **match on every member port** (speed, duplex, VLAN mode, allowed VLANs) — mismatches are the #1 cause of bundles not forming:

```term
SW1(config)# interface range gi0/23 - 24
SW1(config-if-range)# channel-group 1 mode active
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
```

Verify:

```term
SW1# show etherchannel summary
Flags:  P - bundled in port-channel   D - down   SU - Layer2, in use
Group  Port-channel  Protocol    Ports
------+-------------+-----------+---------------------------
1      Po1(SU)       LACP        Gi0/23(P) Gi0/24(P)
```

`(SU)` and `(P)` flags = healthy. Suspended `(s)` members mean a config mismatch.

```callout
{ "type": "exam", "body": "Memorize: LACP = open standard = active/passive; PAgP = Cisco-only = desirable/auto. A question giving you two switch configs and asking 'does the channel form?' is nearly guaranteed." }
```

```quiz
{ "question": "SW1 is configured 'channel-group 1 mode passive'; SW2 uses 'mode passive' too. What happens?", "options": ["An LACP bundle forms normally", "A PAgP bundle forms", "No bundle — both sides only respond, nobody initiates", "The ports err-disable"], "answer": 2, "explanation": "Passive means 'respond if asked' — with both sides passive, no one starts the negotiation. At least one side must be ACTIVE for LACP to form the channel." }
```
