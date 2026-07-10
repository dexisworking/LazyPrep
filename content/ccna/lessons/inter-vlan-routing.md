VLANs isolate — that's their job. But Engineering still needs the Finance printer sometimes. Moving traffic **between** VLANs requires Layer 3, and there are exactly three ways to do it. The CCNA wants you to know all three and when each makes sense.

## Option 1: A router interface per VLAN (legacy)

Give the router one physical interface in each VLAN. Works, but burns a router port and a switch port per VLAN. Nobody builds this anymore; it exists to make the next option make sense.

## Option 2: Router-on-a-Stick (ROAS)

One physical router interface, carved into logical **subinterfaces** — one per VLAN — connected to the switch by a single **trunk**:

```term
R1(config)# interface gi0/0.10
R1(config-subif)# encapsulation dot1q 10
R1(config-subif)# ip address 10.0.10.1 255.255.255.0
R1(config-subif)# interface gi0/0.20
R1(config-subif)# encapsulation dot1q 20
R1(config-subif)# ip address 10.0.20.1 255.255.255.0
```

Each subinterface is the **default gateway** for its VLAN. A packet from VLAN 10 to VLAN 20 goes *up* the trunk tagged 10, gets routed inside R1, and comes back *down* the same trunk tagged 20 — hence "on a stick."

```diagram
{ "type": "flow", "title": "ROAS: VLAN 10 host → VLAN 20 host", "steps": [ { "label": "Host → Switch", "detail": "Frame to gateway 10.0.10.1" }, { "label": "Trunk up, tag 10", "detail": "Switch forwards to router subif .10" }, { "label": "Router routes", "detail": "Between subinterfaces internally" }, { "label": "Trunk down, tag 20", "detail": "Re-framed for 10.0.20.x host" } ] }
```

Great for small sites; the single trunk becomes the bottleneck as traffic grows.

## Option 3: Layer 3 switch with SVIs (the modern standard)

A **multilayer switch** routes in hardware. You create an **SVI (Switched Virtual Interface)** — `interface vlan X` — per VLAN, and it becomes that VLAN's gateway:

```term
SW1(config)# ip routing
SW1(config)# interface vlan 10
SW1(config-if)# ip address 10.0.10.1 255.255.255.0
SW1(config-if)# interface vlan 20
SW1(config-if)# ip address 10.0.20.1 255.255.255.0
```

Traffic between VLANs now routes **inside the switch at wire speed** — no external hop, no trunk bottleneck. This is how virtually every campus distribution layer works.

```diagram
{ "type": "compare", "title": "ROAS vs L3 Switch", "left": { "title": "Router-on-a-Stick", "items": ["One trunk to an external router", "Subinterfaces as gateways", "Cheap — reuses existing router", "Trunk bandwidth is the ceiling"] }, "right": { "title": "L3 switch + SVIs", "items": ["Routing inside the switch ASIC", "SVIs as gateways", "Wire-speed inter-VLAN traffic", "The enterprise default today"] } }
```

```callout
{ "type": "exam", "body": "Recognize ROAS config on sight: subinterfaces (gi0/0.10) + 'encapsulation dot1q <vlan>' + an IP per subif. Common trap: forgetting the encapsulation line, or mismatching subinterface number and VLAN ID (they don't HAVE to match, but the dot1q number must match the VLAN)." }
```

```sort
{ "prompt": "Order the ROAS packet journey from VLAN 10 PC to VLAN 20 PC", "items": ["PC sends frame to its VLAN-10 gateway", "Switch carries it up the trunk tagged VLAN 10", "Router routes between subinterfaces", "Frame returns down the trunk tagged VLAN 20", "Switch delivers to the VLAN-20 PC"] }
```

```quiz
{ "question": "A company's inter-VLAN traffic has outgrown its router-on-a-stick design. What's the standard upgrade?", "options": ["Add a second trunk to the router", "Replace VLANs with one flat network", "Move gateways to SVIs on a Layer 3 switch", "Enable DTP on all links"], "answer": 2, "explanation": "A Layer 3 switch routes between VLANs in hardware at wire speed, removing the trunk bottleneck. Flattening the network sacrifices all VLAN benefits; a second trunk just delays the problem." }
```
