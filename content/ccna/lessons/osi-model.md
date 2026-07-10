Networking's most famous diagram is a filing system. The **OSI model** (Open Systems Interconnection) splits network communication into **seven layers**, each with one job and a clean handoff to its neighbors. Master it and every protocol you ever meet has a labeled drawer to live in.

## The seven layers

```diagram
{ "type": "layers", "title": "The OSI Model — top to bottom", "layers": [ { "label": "Application", "detail": "HTTP, DNS, SMTP — services for user apps", "badge": "7" }, { "label": "Presentation", "detail": "Formats, encryption, compression (TLS, JPEG)", "badge": "6" }, { "label": "Session", "detail": "Opens, manages, tears down dialogs", "badge": "5" }, { "label": "Transport", "detail": "End-to-end delivery — TCP, UDP, ports", "badge": "4" }, { "label": "Network", "detail": "Logical addressing & routing — IP", "badge": "3" }, { "label": "Data Link", "detail": "Local delivery — Ethernet, MAC addresses", "badge": "2" }, { "label": "Physical", "detail": "Bits on the wire — cables, radio, light", "badge": "1" } ] }
```

Classic mnemonics — pick one:

- Top-down: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing
- Bottom-up: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way

## What each layer actually does

**Layer 7 — Application.** The network services applications use: HTTP for web, SMTP for mail, DNS for names. (The *app itself* — Chrome, Outlook — is above the model.)

**Layer 6 — Presentation.** Makes data understandable on both ends: character encoding, compression, and **encryption** (TLS traditionally maps here).

**Layer 5 — Session.** Establishes and manages dialogs between applications — logins that persist, sessions that resume.

**Layer 4 — Transport.** End-to-end delivery between *processes*: **TCP** (reliable, ordered) and **UDP** (fast, best-effort), using **port numbers** to address applications. Data unit: **segment**.

**Layer 3 — Network.** Delivery between *networks*: **IP addresses** and **routing**. Routers live here. Data unit: **packet**.

**Layer 2 — Data Link.** Delivery on the *local* link: **Ethernet frames**, **MAC addresses**, and switches. Data unit: **frame**.

**Layer 1 — Physical.** The actual signals: voltages on copper, light in fiber, radio in air. Data unit: **bits**.

```sort
{ "prompt": "Build the OSI model from the BOTTOM up (Layer 1 first)", "items": ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"] }
```

## Devices and addresses by layer

The model tells you what each device understands:

| Layer | Device | Address |
|---|---|---|
| L7–L5 | Firewalls (NGFW), load balancers | — |
| L4 | Firewalls (port filtering) | Port numbers |
| L3 | **Router**, L3 switch | **IP address** |
| L2 | **Switch** | **MAC address** |
| L1 | Cables, hubs, repeaters | — |

```match
{ "prompt": "Match each item to its OSI layer", "pairs": [ { "left": "IP routing", "right": "Layer 3 — Network" }, { "left": "TCP ports", "right": "Layer 4 — Transport" }, { "left": "MAC addresses", "right": "Layer 2 — Data Link" }, { "left": "Cable voltages", "right": "Layer 1 — Physical" }, { "left": "HTTP", "right": "Layer 7 — Application" } ] }
```

## Why engineers actually use it

The OSI model is a **troubleshooting ladder**. "Users can't reach the site" becomes: cable up (L1)? Switch sees the MAC (L2)? Can you ping the IP (L3)? Is the port open (L4)? Is the service running (L7)? You isolate the broken layer instead of guessing.

```callout
{ "type": "exam", "body": "Know the layer NUMBER, its PDU (bits → frames → packets → segments → data), and its addressing (MAC = L2, IP = L3, ports = L4). 'At which layer does a switch make forwarding decisions?' — Layer 2 — is a guaranteed style of question." }
```

```quiz
{ "question": "A network engineer confirms the cable is good and the switch has learned the PC's MAC address, but the PC can't ping its gateway IP. At which OSI layer does the problem most likely sit?", "options": ["Layer 1 — Physical", "Layer 2 — Data Link", "Layer 3 — Network", "Layer 7 — Application"], "answer": 2, "explanation": "L1 (cable) and L2 (MAC learning) check out. Ping tests IP reachability — Layer 3. A bad IP address, wrong subnet mask, or missing gateway config are the usual suspects." }
```
