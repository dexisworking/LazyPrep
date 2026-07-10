Nobody types IP addresses into 500 laptops. **DHCP (Dynamic Host Configuration Protocol)** hands every device its network identity automatically — address, mask, gateway, DNS — the moment it connects. It's the most-used protocol nobody thinks about, until it breaks.

## DORA — the four-step lease

A booting client and a DHCP server perform a four-message dance (**UDP 67 server / 68 client**):

```diagram
{ "type": "flow", "title": "DORA — how a device gets its address", "steps": [ { "label": "Discover", "detail": "Client broadcasts: \"any DHCP servers out there?\"" }, { "label": "Offer", "detail": "Server: \"how about 10.1.1.50, mask /24, gateway .1?\"" }, { "label": "Request", "detail": "Client broadcasts: \"I accept 10.1.1.50\" (also tells other servers to stand down)" }, { "label": "Acknowledge", "detail": "Server: \"it's yours for 24 hours\" — lease begins" } ] }
```

The lease is temporary: at 50% of lease time the client quietly **renews** (unicast Request → ACK). Fail to renew, and the address returns to the pool.

```sort
{ "prompt": "Order the DHCP messages (the classic memory check)", "items": ["Discover", "Offer", "Request", "Acknowledge"] }
```

## Configuring a Cisco router as DHCP server

Small sites often let the router hand out addresses:

```term
R1(config)# ip dhcp excluded-address 10.1.1.1 10.1.1.20
R1(config)# ip dhcp pool OFFICE
R1(dhcp-config)# network 10.1.1.0 255.255.255.0
R1(dhcp-config)# default-router 10.1.1.1
R1(dhcp-config)# dns-server 8.8.8.8 1.1.1.1
R1(dhcp-config)# lease 1
```

**Exclude before you pool** — reserve the static range (gateways, servers, printers) or DHCP will happily hand your gateway's IP to a laptop. Verify leases with `show ip dhcp binding`.

## The relay problem (exam favorite)

Discover messages are **broadcasts**, and routers kill broadcasts — so a centralized DHCP server can't hear clients on other subnets. Fix: the **DHCP relay agent**. On the *client-facing* interface:

```term
R1(config)# interface gi0/1
R1(config-if)# ip helper-address 10.99.0.5
```

The router converts the client's broadcast into a **unicast** to the server (10.99.0.5), stamping the packet so the server knows *which subnet* to allocate from.

```callout
{ "type": "exam", "body": "\"Clients on VLAN 30 can't get addresses; the DHCP server sits in the data center\" → missing 'ip helper-address' on the VLAN 30 gateway interface. This scenario appears on virtually every exam. Note WHERE it goes: the interface facing the CLIENTS." }
```

## Client-side view & troubleshooting

```term
C:\> ipconfig /all
   DHCP Enabled . . . . . . . : Yes
   IPv4 Address . . . . . . . : 10.1.1.53
   Lease Expires  . . . . . . : 12 July 2026 09:14:22
C:\> ipconfig /release && ipconfig /renew
```

The failure signature you already know: a client showing **169.254.x.x (APIPA)** never heard an Offer. Work the chain: client VLAN? Port up? Helper address present? Server pool exhausted?

```match
{ "prompt": "Match the symptom to the likely DHCP culprit", "pairs": [ { "left": "Client has 169.254.20.9", "right": "No DHCP reply — check reachability/relay" }, { "left": "Remote-subnet clients fail, local ones work", "right": "Missing ip helper-address" }, { "left": "Gateway IP handed to a laptop", "right": "Forgot excluded-address" }, { "left": "Addresses exhausted at 9am daily", "right": "Pool too small / lease too long" } ] }
```

```quiz
{ "question": "The DHCP server lives at 10.50.0.10 in the data center. Clients in VLAN 40 (gateway 10.40.0.1 on interface gi0/2) get no addresses. What fixes it?", "options": ["'ip helper-address 10.50.0.10' on gi0/2", "'ip helper-address 10.40.0.1' on the server", "A default route on the clients", "Enable DHCP snooping on the switch"], "answer": 0, "explanation": "The relay command belongs on the router interface facing the clients (gi0/2), pointing at the server's address. It converts client broadcasts into unicasts the routed network can deliver." }
```
