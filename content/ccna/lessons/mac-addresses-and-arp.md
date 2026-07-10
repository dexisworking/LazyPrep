Every network interface on Earth ships with a unique **MAC address** — its Layer 2 identity. But applications speak in IP addresses. The bridge between the two worlds is **ARP**, one of the most-asked-about protocols on the CCNA.

## MAC addresses up close

A MAC is **48 bits**, written as 12 hex digits: `3C:52:82:4F:9A:D1`.

- First 24 bits: **OUI** (Organizationally Unique Identifier) — identifies the manufacturer.
- Last 24 bits: vendor-assigned serial — unique per interface.
- "Burned in" at the factory (BIA), though modern systems can override it in software (privacy randomization on phones does exactly this).

```flip
{ "title": "MAC facts", "cards": [ { "front": "How long is a MAC address?", "back": "48 bits — 6 bytes — 12 hex digits" }, { "front": "What does the first half (OUI) identify?", "back": "The manufacturer of the interface" }, { "front": "The all-ones MAC FF:FF:FF:FF:FF:FF means…", "back": "Broadcast — every host on the LAN" }, { "front": "Scope of a MAC address", "back": "The local link only — never crosses a router" } ] }
```

## The problem ARP solves

Your laptop wants to send a packet to `192.168.1.30`. It knows the **IP**, but the Ethernet frame needs a **destination MAC**. Nothing in an IP address reveals the MAC — so the laptop must ask.

## ARP in two messages

```diagram
{ "type": "flow", "title": "Address Resolution Protocol", "steps": [ { "label": "ARP Request (broadcast)", "detail": "\"Who has 192.168.1.30? Tell 192.168.1.20\" — sent to FF:FF:FF:FF:FF:FF, everyone hears it" }, { "label": "ARP Reply (unicast)", "detail": "\"192.168.1.30 is at 3C:52:82:4F:9A:D1\" — sent directly back to the asker" }, { "label": "Cache it", "detail": "Both hosts store the IP→MAC mapping in their ARP table for next time" } ] }
```

The learned mappings live in the **ARP table** (cache), so the broadcast happens once per neighbor, not per packet:

```term
C:\> arp -a
Interface: 192.168.1.20
  Internet Address      Physical Address      Type
  192.168.1.1           58-ef-68-1a-2b-3c     dynamic
  192.168.1.30          3c-52-82-4f-9a-d1     dynamic
```

## The gateway subtlety (exam favorite)

ARP only works on the **local network** — broadcasts don't cross routers. So:

- Destination on **my subnet** → ARP for the *destination's* MAC directly.
- Destination on **another network** → ARP for the **default gateway's** MAC, and frame the packet to the router.

This decision is made by comparing the destination IP against your own subnet mask — subnetting (next module) is literally how hosts decide who to ARP for.

```quiz
{ "question": "PC-A (10.1.1.10/24) sends a packet to a server at 172.16.5.5. Whose MAC address does PC-A request via ARP?", "options": ["The server's MAC", "The default gateway's MAC", "The nearest switch's MAC", "No ARP needed — IP is enough"], "answer": 1, "explanation": "172.16.5.5 is outside PC-A's 10.1.1.0/24 subnet, so the frame must go to the default gateway. PC-A ARPs for the GATEWAY's MAC. (Switches are transparent — frames are never addressed to them.)" }
```

```callout
{ "type": "warning", "body": "ARP has zero authentication — any device can claim any IP. 'ARP spoofing' lets an attacker impersonate the gateway and intercept traffic. Remember this for the security module, where Dynamic ARP Inspection (DAI) is the defense." }
```

```quiz
{ "question": "Which frame type carries an ARP Request?", "options": ["Unicast to the target host", "Broadcast to FF:FF:FF:FF:FF:FF", "Multicast to 01:00:5E:00:00:01", "It is sent as an IP packet, not a frame"], "answer": 1, "explanation": "The sender doesn't yet know the target's MAC — that's the whole point — so the request is broadcast for everyone to hear. Only the owner of the IP replies, via unicast." }
```
