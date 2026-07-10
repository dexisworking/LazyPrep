**Ethernet** is the language of the LAN — the Layer 2 protocol carrying virtually all wired local traffic. Its unit of currency is the **frame**. Learn to dissect one and switching stops being magic.

## Anatomy of an Ethernet frame

```diagram
{ "type": "flow", "title": "Ethernet II frame — left to right on the wire", "steps": [ { "label": "Preamble + SFD", "detail": "8 bytes of sync pattern — 'incoming!'" }, { "label": "Destination MAC", "detail": "6 bytes — who this is for" }, { "label": "Source MAC", "detail": "6 bytes — who sent it" }, { "label": "Type", "detail": "2 bytes — what's inside (0x0800 = IPv4, 0x86DD = IPv6)" }, { "label": "Payload", "detail": "46–1500 bytes — the encapsulated packet" }, { "label": "FCS", "detail": "4 bytes — checksum to catch corruption" } ] }
```

Field-by-field:

- **Preamble & SFD** — alternating bits that let the receiver lock onto the signal timing, ended by the Start Frame Delimiter. Not counted in the frame size.
- **Destination & Source MAC** — the L2 addresses. Destination comes *first* so switches can start forwarding decisions immediately.
- **Type (EtherType)** — announces the payload protocol: `0x0800` IPv4, `0x86DD` IPv6, `0x0806` ARP.
- **Payload** — the packet from Layer 3. Minimum 46 bytes (padded if shorter), default maximum **1500 bytes** — the famous **MTU**.
- **FCS (Frame Check Sequence)** — a CRC32 checksum in the *trailer*. Receivers recompute it; mismatch = frame silently discarded (corruption caught, recovery left to upper layers).

```callout
{ "type": "exam", "body": "Numbers worth memorizing: MAC = 6 bytes (48 bits), EtherType 0x0800 = IPv4, payload 46–1500 bytes, minimum full frame 64 bytes, FCS = error DETECTION (not correction). A frame under 64 bytes is a 'runt'; over the max is a 'giant'." }
```

## Frame size and MTU

The **MTU (Maximum Transmission Unit)** — 1500 bytes by default — caps how much L3 packet fits in one frame. Larger packets must be **fragmented** (IPv4) or dropped. Data centers often enable **jumbo frames** (up to ~9000 bytes) to reduce per-frame overhead on storage traffic; every device on the path must agree.

## Three delivery modes

The destination MAC defines who should receive a frame:

- **Unicast** — one specific interface (`3C:52:82:...`).
- **Broadcast** — everyone on the LAN: `FF:FF:FF:FF:FF:FF`. Used by ARP and DHCP discovery.
- **Multicast** — a subscribed group (`01:00:5E:...` range). Used by routing protocols, streaming.

```match
{ "prompt": "Match the destination MAC to the delivery type", "pairs": [ { "left": "FF:FF:FF:FF:FF:FF", "right": "Broadcast — all hosts on the LAN" }, { "left": "3C:52:82:4F:9A:D1", "right": "Unicast — one specific NIC" }, { "left": "01:00:5E:00:00:05", "right": "Multicast — subscribed group (OSPF!)" } ] }
```

## Duplex and speed — the handshake before the frames

Two connected interfaces negotiate **speed** (100M/1G/10G) and **duplex** (full = both talk simultaneously; half = take turns, legacy). **Autonegotiation** almost always gets this right; a *duplex mismatch* (one side full, other half) produces a link that works but performs terribly — a classic troubleshooting scenario with late collisions and CRC errors.

```term
Switch# show interfaces gi0/1 | include duplex
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
```

```quiz
{ "question": "A switch receives a frame and computes an FCS value different from the one in the trailer. What happens?", "options": ["The switch corrects the errored bits and forwards", "The switch forwards it flagged as suspect", "The switch silently discards the frame", "The switch sends an ICMP error to the source"], "answer": 2, "explanation": "FCS provides error DETECTION only. A failed check means corruption, and the frame is dropped without notification — it's up to higher layers (like TCP) to notice and retransmit." }
```
