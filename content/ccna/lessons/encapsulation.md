The OSI layers aren't just a filing system — they're an assembly line. Every message you send is wrapped, layer by layer, like a letter going into envelopes inside envelopes. That wrapping is **encapsulation**, and it's how the layers cooperate without knowing each other's business.

## Wrapping on the way down

When you hit *send*, your data descends the stack. Each layer prepends its own **header** (control information) to whatever it received from above:

```diagram
{ "type": "flow", "title": "Encapsulation — sender's stack, top to bottom", "direction": "vertical", "steps": [ { "label": "Application data", "detail": "The actual message (an HTTP request, say)" }, { "label": "+ TCP/UDP header → SEGMENT", "detail": "Ports, sequence numbers — Layer 4" }, { "label": "+ IP header → PACKET", "detail": "Source & destination IP — Layer 3" }, { "label": "+ Ethernet header & trailer → FRAME", "detail": "Source & destination MAC, checksum — Layer 2" }, { "label": "BITS on the medium", "detail": "Electrical/optical/radio signals — Layer 1" } ] }
```

The receiver runs the same process in reverse — **de-encapsulation** — peeling each envelope, checking its header, and passing the contents up.

## PDUs — name the envelope

Each stage of wrapping has an official name, its **Protocol Data Unit (PDU)**:

| Layer | PDU |
|---|---|
| Transport (L4) | **Segment** |
| Network (L3) | **Packet** |
| Data Link (L2) | **Frame** |
| Physical (L1) | **Bits** |

```sort
{ "prompt": "Order the PDUs as data is encapsulated on the SENDING host", "items": ["Data (application)", "Segment (L4)", "Packet (L3)", "Frame (L2)", "Bits (L1)"] }
```

```callout
{ "type": "exam", "body": "Exam phrasing to expect: 'What is the PDU at Layer 3?' (packet) or 'A switch received the PDU — what does it examine?' (the frame's destination MAC). PDU names are pure memorization — lock them in now." }
```

## The key insight: layers only read their own header

A **switch** receives a frame, reads the **Layer 2 header** (MACs), and forwards. It never opens the IP packet inside.
A **router** strips the frame, reads the **Layer 3 header** (IPs), picks a path — then builds a **brand-new frame** for the next link.

This means the L2 envelope is **rewritten at every router hop**, while the L3 packet (source and destination IP) stays intact end to end. That single fact explains more exam questions than any other in this module.

```flip
{ "title": "Check yourself", "cards": [ { "front": "Which addresses change at every router hop?", "back": "MAC addresses (the frame is rebuilt per link)" }, { "front": "Which addresses stay constant end-to-end?", "back": "Source and destination IP (barring NAT)" }, { "front": "What does a switch examine to forward?", "back": "The destination MAC in the frame header" }, { "front": "Frame check sequence (FCS) lives where?", "back": "The Ethernet TRAILER — error detection" } ] }
```

## Same-layer & adjacent-layer interaction

Two useful phrases from the exam blueprint:

- **Adjacent-layer interaction** — a layer serves the layer above it on the *same host* (TCP hands its segment to IP).
- **Same-layer interaction** — a layer converses with its *peer* on the remote host via headers (your TCP talks to the server's TCP through sequence numbers; neither cares how the bits traveled).

```quiz
{ "question": "A packet crosses three routers between PC-A and Server-B. How many times is the Layer 2 frame rebuilt, and do the IP addresses change?", "options": ["Rebuilt 0 times; IPs change at each hop", "Rebuilt 3 times; IPs stay the same", "Rebuilt 4 times; IPs stay the same", "Rebuilt 4 times; IPs change at each hop"], "answer": 2, "explanation": "There are 4 links (PC→R1, R1→R2, R2→R3, R3→Server), and each link needs its own frame — so L2 is rebuilt 4 times. The IP header's source/destination stay constant end to end (assuming no NAT)." }
```
