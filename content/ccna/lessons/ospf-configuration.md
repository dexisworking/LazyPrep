Theory becomes muscle memory here: enabling OSPF, verifying adjacencies, and reading its output are hands-on CCNA tasks. Two configuration styles exist — learn both, prefer the modern one.

## Style 1: the classic `network` command

```term
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 10.1.0.0 0.0.255.255 area 0
R1(config-router)# network 192.168.1.1 0.0.0.0 area 0
```

Notes that trip people up:

- The **process ID** (`1`) is locally significant — neighbors don't need to match it.
- `network` uses a **wildcard mask** (inverted subnet mask): `0.0.255.255` ≈ /16, `0.0.0.0` = exactly this IP.
- The command doesn't advertise a network per se — it **enables OSPF on any interface whose IP matches**, and *those interfaces'* networks get advertised.

## Style 2: interface-based (modern, clearer)

```term
R1(config)# interface gi0/1
R1(config-if)# ip ospf 1 area 0
```

Same result, zero wildcard arithmetic, obvious intent. Use this in new configs.

## The supporting cast

```term
R1(config-router)# passive-interface gi0/2      ! advertise the subnet, send no Hellos (host-facing LANs)
R1(config-router)# default-information originate ! share my default route with the OSPF domain
R1(config-if)# ip ospf cost 50                   ! manual cost override
R1(config-if)# ip ospf priority 10               ! influence DR election
```

**Passive-interface** on user-facing LANs is both hygiene and security — no reason to solicit adjacencies from office PCs.

```callout
{ "type": "exam", "body": "Wildcard masks are subnet masks with every bit flipped: /24 → 0.0.0.255, /30 → 0.0.0.3, /32 → 0.0.0.0. If a lab's adjacency won't form, first check whether the network statement's wildcard actually covers the interface IP." }
```

## Verification — the big three

```term
R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:35    10.1.12.2       GigabitEthernet0/1
3.3.3.3           1   FULL/BDR        00:00:33    10.1.13.3       GigabitEthernet0/2
```

```term
R1# show ip ospf interface brief
Interface    PID   Area   IP Address/Mask    Cost  State Nbrs F/C
Gi0/1        1     0      10.1.12.1/30       100   DROTH 1/1
```

```term
R1# show ip route ospf
O     10.2.0.0/24 [110/200] via 10.1.12.2, 00:05:12, GigabitEthernet0/1
```

Reading `FULL/DR`: *our* adjacency state is FULL; the *neighbor's* role on that segment is DR. `FULL/ -` appears on point-to-point links (no DR election there at all).

```match
{ "prompt": "Match the show command to the question it answers", "pairs": [ { "left": "show ip ospf neighbor", "right": "Are my adjacencies up, and who's DR?" }, { "left": "show ip route ospf", "right": "Which routes did OSPF actually install?" }, { "left": "show ip ospf interface", "right": "Cost, area, timers, state per interface" }, { "left": "show ip protocols", "right": "Router ID, networks covered, passive interfaces" } ] }
```

## A complete two-router lab

```term
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 10.1.12.0 0.0.0.3 area 0
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
!
R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
R2(config-router)# network 10.1.12.0 0.0.0.3 area 0
R2(config-router)# network 192.168.2.0 0.0.0.255 area 0
```

Within seconds: adjacency FULL, and each router sees the other's LAN as an `O` route. That loop — configure, `show ip ospf neighbor`, `show ip route` — is the rhythm of every routing lab you'll ever run.

```sort
{ "prompt": "Order the OSPF troubleshooting flow for a missing route", "items": ["Is the interface up/up with the right IP?", "Is OSPF enabled on that interface (network/ip ospf)?", "Is the neighbor adjacency FULL?", "Does show ip route show the O route?"] }
```

```quiz
{ "question": "R1 has 'network 10.1.12.0 0.0.0.3 area 0'. Its gi0/1 is 10.1.12.5/30. Does OSPF activate on gi0/1?", "options": ["Yes — the wildcard covers the whole /24", "No — 0.0.0.3 covers only 10.1.12.0–10.1.12.3, and .5 is outside it", "Yes — process ID 1 enables all interfaces", "No — OSPF requires the interface command style"], "answer": 1, "explanation": "Wildcard 0.0.0.3 spans exactly four addresses: 10.1.12.0–.3. The interface at .5 (the NEXT /30 block) doesn't match, so OSPF never activates there. Fix: network 10.1.12.4 0.0.0.3 area 0." }
```
