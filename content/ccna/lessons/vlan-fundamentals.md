One physical switch, many logical networks — that's a **VLAN** (Virtual LAN). VLANs are how real networks separate departments, contain broadcasts, and enforce security without buying a switch per team.

## The problem: one big broadcast domain

By default every port on a switch shares **one broadcast domain**. Every ARP request, every DHCP discover — all 200 devices hear it. Worse: accounting PCs and guest laptops sit on the same logical network with nothing between them.

## The fix: segment logically

A VLAN carves a switch into isolated logical switches:

```diagram
{ "type": "compare", "title": "One switch, two VLANs", "left": { "title": "VLAN 10 — Engineering", "items": ["Ports Gi0/1–12", "Own broadcast domain", "Subnet 10.0.10.0/24", "Cannot reach VLAN 20 without a router"] }, "right": { "title": "VLAN 20 — Finance", "items": ["Ports Gi0/13–24", "Own broadcast domain", "Subnet 10.0.20.0/24", "Isolated from Engineering at Layer 2"] } }
```

Key consequences:

- **Broadcasts stay inside their VLAN** — smaller failure and noise domains.
- **Inter-VLAN traffic requires a Layer 3 device** — VLANs are as separate as physically separate switches. This is a feature: the router/firewall between them is your policy point.
- **One VLAN ↔ one IP subnet** is the universal design convention.

## Why VLANs (the exam's four reasons)

1. **Security** — isolate sensitive systems at Layer 2.
2. **Performance** — fewer broadcasts per domain.
3. **Flexibility** — group users by role, not by cable location.
4. **Cost** — logical segmentation instead of parallel hardware.

## Access ports — assigning devices

An **access port** belongs to exactly one VLAN; the device plugged in never sees a tag or knows VLANs exist:

```term
Switch(config)# vlan 10
Switch(config-vlan)# name ENGINEERING
Switch(config-vlan)# exit
Switch(config)# interface range gi0/1 - 12
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 10
```

Verify with:

```term
Switch# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -----------------------
1    default                          active    Gi0/13, Gi0/14
10   ENGINEERING                      active    Gi0/1, Gi0/2, Gi0/3
20   FINANCE                          active    Gi0/15, Gi0/16
```

```callout
{ "type": "warning", "body": "VLAN 1 is the default VLAN — every port starts there, and it can't be deleted. Best practice: don't use VLAN 1 for user traffic, and move management traffic to a dedicated VLAN. Attackers know everyone forgets this." }
```

```flip
{ "title": "VLAN essentials", "cards": [ { "front": "A VLAN equals one ______ domain", "back": "Broadcast domain (and by convention, one IP subnet)" }, { "front": "Port carrying exactly one VLAN, untagged", "back": "Access port" }, { "front": "What's needed for VLAN 10 to talk to VLAN 20?", "back": "A Layer 3 device — router or L3 switch" }, { "front": "Default VLAN on Cisco switches", "back": "VLAN 1" } ] }
```

```quiz
{ "question": "PC-1 in VLAN 10 and PC-2 in VLAN 20 hang off the SAME switch and can't ping each other. IP settings are correct. Why?", "options": ["The switch's MAC table is full", "Traffic between VLANs requires a Layer 3 device", "VLANs must be renumbered to match", "The PCs need crossover cables"], "answer": 1, "explanation": "Different VLANs are separate broadcast domains — Layer 2 isolation is exactly what VLANs are for. Reaching across requires routing (a router-on-a-stick or an L3 switch SVI — covered two lessons from now)." }
```
