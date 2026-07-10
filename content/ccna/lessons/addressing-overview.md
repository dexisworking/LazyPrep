Every conversation on a network uses **three addresses at once**. Confuse them and networking stays foggy forever; separate them and everything clicks. This short lesson is that separation.

## The three addresses

**MAC address (Layer 2)** — the *hardware* address, burned into every network interface. 48 bits, written in hex: `3C:52:82:4F:9A:D1`. Scope: the **local link only** — MAC addresses get traffic across one switch/segment, no further.

**IP address (Layer 3)** — the *logical* address, assigned by configuration or DHCP: `192.168.1.20`. Scope: **end to end** — IP gets traffic from your device to any network in the world.

**Port number (Layer 4)** — the *application* address inside a device: web servers listen on `443`, DNS on `53`. Ports let one machine run many services and keep every browser tab's traffic separate.

```diagram
{ "type": "layers", "title": "Three addresses, three scopes", "layers": [ { "label": "Port number", "detail": "WHICH APPLICATION on the device — e.g. 443", "badge": "L4" }, { "label": "IP address", "detail": "WHICH DEVICE, end-to-end across networks", "badge": "L3" }, { "label": "MAC address", "detail": "WHICH INTERFACE, on the local link only", "badge": "L2" } ] }
```

## The postal analogy

Sending a parcel to an office worker:

- **IP address** = the building's street address (gets it across the country).
- **MAC address** = the internal mailroom routing on each leg of the trip (changes at every courier handoff).
- **Port** = the person's desk number (which service inside the building).

## Watch them work together

Your laptop (192.168.1.20) browses a server across the Internet:

```diagram
{ "type": "flow", "title": "Who addresses what", "steps": [ { "label": "Frame to gateway", "detail": "Dest MAC = router's MAC (local hop)" }, { "label": "Packet end-to-end", "detail": "Dest IP = server's IP (never changes)" }, { "label": "Segment to service", "detail": "Dest port = 443 (the web server process)" } ] }
```

Notice the pattern from the encapsulation lesson: **MACs are per-hop, IPs are end-to-end, ports are per-application**.

```flip
{ "title": "Speed drill", "cards": [ { "front": "48-bit hex hardware address", "back": "MAC — Layer 2, local link scope" }, { "front": "Logical address that crosses networks", "back": "IP — Layer 3, end-to-end scope" }, { "front": "Number identifying an application/service", "back": "Port — Layer 4" }, { "front": "Which address does a switch read?", "back": "Destination MAC" } ] }
```

```quiz
{ "question": "A PC sends traffic to a web server on a DIFFERENT network. What does the PC put in the frame and packet headers?", "options": ["Dest MAC = server's MAC; Dest IP = server's IP", "Dest MAC = router's MAC; Dest IP = server's IP", "Dest MAC = router's MAC; Dest IP = router's IP", "Dest MAC = server's MAC; Dest IP = router's IP"], "answer": 1, "explanation": "IP is end-to-end (the server's address), but MAC only crosses the local link — so the frame is addressed to the default gateway's MAC. The router then re-frames it for the next hop." }
```
