Traditional networking is a democracy of boxes: every router thinks for itself, and engineers configure them one CLI at a time. **Software-Defined Networking (SDN)** proposes a different government — centralize the thinking, let devices just forward. Understanding this shift (and its vocabulary) closes out your CCNA journey.

## The three planes

Every network device's work divides into planes:

```diagram
{ "type": "layers", "title": "The planes of a network device", "layers": [ { "label": "Management plane", "detail": "How humans/tools configure it — SSH, SNMP, APIs", "badge": "M" }, { "label": "Control plane", "detail": "The thinking — routing protocols, STP, ARP, building tables", "badge": "C" }, { "label": "Data plane", "detail": "The doing — forwarding each frame/packet per those tables", "badge": "D" } ] }
```

Traditional device: all three planes in one box. **SDN's move: pull the control plane (or its policy brain) into a central controller**, leaving devices to forward at silicon speed.

## Controllers and their APIs

The **SDN controller** holds a global view of the network and programs devices. Its interfaces get directional names:

- **Southbound APIs (SBI)** — controller → devices: OpenFlow, NETCONF/RESTCONF, or good old SSH driven programmatically.
- **Northbound APIs (NBI)** — apps/scripts → controller: nearly always **REST** (next lesson). Your automation never touches boxes; it asks the controller.

```diagram
{ "type": "flow", "title": "SDN's chain of command", "direction": "vertical", "steps": [ { "label": "Your app / script", "detail": "\"Give the voice VLAN priority everywhere\"" }, { "label": "Northbound API (REST)", "detail": "Intent expressed to the controller" }, { "label": "SDN controller", "detail": "Computes device-level changes from the global view" }, { "label": "Southbound API", "detail": "NETCONF/RESTCONF/OpenFlow push to every device" } ] }
```

## Cisco's controller portfolio (recognize the names)

- **Catalyst Center** (formerly DNA Center) — enterprise campus controller: intent-based provisioning, assurance/analytics, SD-Access automation.
- **SD-WAN (vManage)** — the WAN controller from last lesson.
- **ACI (APIC)** — the data-center flavor.

The buzzphrase **intent-based networking (IBN)**: you declare *what* ("marketing can't reach finance"), the controller derives and maintains *how* (ACLs, VLANs, policies per device), then continuously verifies reality matches intent.

```match
{ "prompt": "Match the SDN term to its meaning", "pairs": [ { "left": "Control plane", "right": "Protocol logic that builds forwarding tables" }, { "left": "Data plane", "right": "Hardware forwarding of each packet" }, { "left": "Southbound API", "right": "Controller programming the devices" }, { "left": "Northbound API", "right": "Apps talking REST to the controller" } ] }
```

## Why it matters (even for a CLI lover)

A 500-switch campus with per-box config drifts — typos, snowflakes, undocumented changes. Controller-based networks give **one source of truth**, config generated from policy, changes applied atomically network-wide, and telemetry checked against intent. The CLI isn't dying; it's becoming the *output* of automation rather than the input.

```callout
{ "type": "exam", "body": "Plane identification is the reliable question: 'OSPF exchanging LSAs' → control plane; 'a frame forwarded by the MAC table' → data plane; 'SSHing to configure' → management plane. Plus: northbound = toward apps (REST), southbound = toward devices." }
```

```quiz
{ "question": "In a controller-based network, a Python script requests 'block IoT VLAN from the data center' and the controller reconfigures 40 switches. Which interface did the script use, and which did the controller use?", "options": ["Southbound for both", "Northbound (script→controller), southbound (controller→switches)", "Northbound for both", "Data plane, then control plane"], "answer": 1, "explanation": "Apps and scripts speak to the controller via its NORTHBOUND (usually REST) API; the controller pushes device changes via SOUTHBOUND protocols (NETCONF, RESTCONF, OpenFlow, SSH). Direction names are relative to the controller." }
```
