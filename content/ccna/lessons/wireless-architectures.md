One access point is simple. Two hundred APs across a campus — with seamless roaming, unified security, and one place to configure it all — requires architecture. This lesson covers how enterprise wireless is actually organized.

## SSIDs, BSSs, and the vocabulary

- **SSID** — the network *name* users see.
- **BSS (Basic Service Set)** — one AP's cell; identified by its **BSSID** (the AP's radio MAC).
- **ESS (Extended Service Set)** — multiple APs advertising the *same* SSID so clients roam between cells.
- A client **associates** with one AP at a time and roams to the next as signal fades.

## Autonomous APs — islands of config

An **autonomous AP** is self-contained: full config lives on the box. Perfect for a café; a nightmare at scale — changing a password on 200 APs means 200 logins (or fragile scripts). Roaming coordination and RF tuning across APs? You're on your own.

## Lightweight APs + WLC — the enterprise standard

Enterprise wireless splits the work: **lightweight APs** handle real-time radio (beacons, encryption per frame, retransmissions), while a central **WLC (Wireless LAN Controller)** owns everything else — configuration, client authentication, roaming, RF optimization. This is **split-MAC architecture**.

APs and WLC talk through **CAPWAP** tunnels (UDP 5246 control / 5247 data), which means an AP can sit anywhere IP reaches the controller:

```diagram
{ "type": "flow", "title": "Lightweight AP joining a WLC", "steps": [ { "label": "AP boots & discovers", "detail": "Finds a WLC via DHCP option 43, DNS, or broadcast" }, { "label": "CAPWAP tunnel forms", "detail": "AP authenticates; config pushed from controller" }, { "label": "Operation", "detail": "AP handles radio; WLC handles policy, roaming, RF" } ] }
```

Client traffic is typically tunneled to the WLC too — so the *controller's* switch port is a **trunk** carrying every WLAN's VLAN, while the *AP's* switch port is usually an **access port** (the CAPWAP tunnel needs just one VLAN).

```callout
{ "type": "exam", "body": "Port-config trivia they love: lightweight AP → ACCESS port; WLC → TRUNK port. Also CAPWAP's split: control traffic UDP 5246, data 5247. And 'split-MAC' = radio functions on the AP, management functions on the WLC." }
```

## Deployment flavors

- **Centralized** — WLC in the data center; typical campus.
- **FlexConnect** — APs at branches switch traffic *locally* when the WAN to the controller is down (or by design), instead of hairpinning everything.
- **Cloud-managed** (e.g. Meraki) — the "controller" is a cloud dashboard.
- **Embedded/Mobility Express** — a WLC living inside a switch or an AP itself, for small sites.

```diagram
{ "type": "compare", "title": "Autonomous vs Lightweight + WLC", "left": { "title": "Autonomous", "items": ["Full config on each AP", "Fine for a handful of APs", "No central roaming/RF brain", "Management cost grows per AP"] }, "right": { "title": "Lightweight + WLC", "items": ["Config lives on the controller", "Scales to thousands of APs", "Coordinated roaming & RF tuning", "CAPWAP tunnels AP ↔ WLC"] } }
```

```match
{ "prompt": "Match the wireless term to its definition", "pairs": [ { "left": "SSID", "right": "The network name users select" }, { "left": "BSSID", "right": "One AP radio's MAC identifying its cell" }, { "left": "ESS", "right": "Many APs, same SSID, roaming clients" }, { "left": "CAPWAP", "right": "The AP ↔ controller tunnel protocol" }, { "left": "FlexConnect", "right": "Branch APs switching traffic locally" } ] }
```

```quiz
{ "question": "A university with 800 APs needs centralized config, seamless roaming, and RF auto-tuning. Which architecture fits?", "options": ["Autonomous APs with identical SSIDs", "Lightweight APs managed by WLCs via CAPWAP", "A mesh of consumer routers", "One giant high-power AP"], "answer": 1, "explanation": "At hundreds of APs, per-device management is untenable — the lightweight/WLC split-MAC model centralizes policy, roaming, and RF optimization while APs handle real-time radio. That's exactly what it was built for." }
```
