VLANs live on one switch — until you need Engineering on floor 1 *and* floor 3. Connecting VLANs across switches without a cable per VLAN is the job of **trunking**, powered by the **IEEE 802.1Q** standard.

## The problem trunks solve

Two switches, each with VLANs 10 and 20. Naively you'd need one link per VLAN — that's a port and cable per VLAN, forever. Instead, run **one link that carries all VLANs** and label every frame with its VLAN membership.

```diagram
{ "type": "compare", "title": "Access link vs Trunk link", "left": { "title": "Access link", "items": ["Carries ONE VLAN", "Frames untagged — host never sees VLAN info", "Connects end devices", "switchport mode access"] }, "right": { "title": "Trunk link", "items": ["Carries MANY VLANs", "Frames tagged with 802.1Q VLAN ID", "Connects switches (and routers/APs)", "switchport mode trunk"] } }
```

## The 802.1Q tag

On a trunk, the switch inserts a **4-byte tag** into each Ethernet frame, right after the source MAC. Its key field is the **VLAN ID (12 bits)** — supporting VLANs 1–4094. The receiving switch reads the tag, strips it, and delivers the frame inside the right VLAN.

```callout
{ "type": "exam", "body": "802.1Q inserts 4 bytes INTO the existing frame (forcing FCS recalculation). The VLAN ID field is 12 bits → 4094 usable VLANs. Tag sits between Source MAC and Type. These specifics are classic exam trivia." }
```

## The native VLAN — the untagged exception

One VLAN per trunk is designated the **native VLAN** (default: VLAN 1). Frames of the native VLAN cross the trunk **untagged**. It exists for legacy compatibility — and it's a security footgun:

- **Both ends must agree** on the native VLAN, or frames leak between VLANs (CDP will warn about a mismatch).
- Best practice: set the native VLAN to an **unused** VLAN and never assign hosts to it.

## Configuring a trunk

```term
Switch(config)# interface gi0/24
Switch(config-if)# switchport trunk encapsulation dot1q
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk native vlan 999
Switch(config-if)# switchport trunk allowed vlan 10,20,30
```

- `allowed vlan` prunes the trunk to just the VLANs it should carry — good hygiene and security.
- Verify with `show interfaces trunk`:

```term
Switch# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi0/24      on           802.1q         trunking      999

Port        Vlans allowed on trunk
Gi0/24      10,20,30
```

## DTP — the negotiation you should disable

Cisco's **Dynamic Trunking Protocol** lets ports negotiate trunking automatically (`dynamic auto` / `dynamic desirable` modes). Convenient — and exploitable: an attacker's device can negotiate itself a trunk and see every VLAN. Modern practice: **hard-code** `mode access` or `mode trunk` and turn negotiation off with `switchport nonegotiate`.

```match
{ "prompt": "Match the term to its meaning", "pairs": [ { "left": "802.1Q tag", "right": "4 bytes carrying the frame's VLAN ID" }, { "left": "Native VLAN", "right": "Crosses the trunk UNtagged" }, { "left": "Allowed VLAN list", "right": "Restricts which VLANs a trunk carries" }, { "left": "DTP", "right": "Auto-negotiates trunking — disable it" } ] }
```

```quiz
{ "question": "A frame from VLAN 999 (the configured native VLAN) is sent across an 802.1Q trunk. What's special about it?", "options": ["It gets a double tag", "It is dropped — native VLANs can't cross trunks", "It crosses the trunk without any 802.1Q tag", "It is converted to a broadcast"], "answer": 2, "explanation": "The native VLAN is the one VLAN that traverses a trunk untagged. That's also why both ends must agree on it — an untagged frame is assumed to belong to the receiver's native VLAN." }
```
