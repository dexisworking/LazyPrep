Layer 4 offers exactly two products: **TCP**, the armored courier that guarantees delivery, and **UDP**, the postcard that just goes fast. Every application picks one, and the trade-off between them explains half of how the Internet feels.

## Ports — addressing applications

Both protocols use **16-bit port numbers** (0–65535) to address the *process* inside a device:

- **Well-known ports (0–1023)** — standardized services.
- **Registered (1024–49151)** and **ephemeral (49152–65535)** — the random high ports clients use as their source.

A connection is uniquely identified by the **socket 5-tuple**: protocol + source IP + source port + destination IP + destination port. That's how one server on port 443 juggles a million clients.

```flip
{ "title": "Port numbers you MUST know", "cards": [ { "front": "HTTP / HTTPS", "back": "TCP 80 / TCP 443" }, { "front": "SSH / Telnet", "back": "TCP 22 / TCP 23" }, { "front": "DNS", "back": "UDP 53 (TCP 53 for zone transfers & big replies)" }, { "front": "DHCP", "back": "UDP 67 (server) / 68 (client)" }, { "front": "FTP / TFTP", "back": "TCP 20-21 / UDP 69" }, { "front": "SMTP / POP3 / IMAP", "back": "TCP 25 / 110 / 143" }, { "front": "SNMP / Syslog", "back": "UDP 161 / UDP 514" }, { "front": "NTP", "back": "UDP 123" } ] }
```

## TCP — reliability engineered

TCP promises: **every byte arrives, in order, exactly once**. Its machinery:

- **Connection setup** — the **three-way handshake**.
- **Sequence numbers** — every byte is numbered → ordering + duplicate detection.
- **Acknowledgments & retransmission** — unacknowledged data is resent.
- **Flow control** — the receiver's **window** says "send at most this much before waiting"; windows scale up and down dynamically.

```diagram
{ "type": "flow", "title": "The three-way handshake", "steps": [ { "label": "SYN", "detail": "Client → server: \"let's talk, my sequence starts at X\"" }, { "label": "SYN-ACK", "detail": "Server → client: \"acknowledged X, mine starts at Y\"" }, { "label": "ACK", "detail": "Client → server: \"acknowledged Y\" — connection established" } ] }
```

Teardown uses **FIN/ACK** exchanges (graceful) or **RST** (abort). 

## UDP — speed by subtraction

UDP adds only ports and a checksum to IP. No handshake, no ordering, no retransmission — and therefore **no delay overhead**. Perfect when:

- **Real-time beats complete** — voice/video: a retransmitted syllable arrives too late to matter.
- **Tiny exchanges** — DNS: one question, one answer; a handshake would triple the cost.
- **The app handles reliability itself** — TFTP, QUIC (HTTP/3 builds reliability *on top of* UDP).

```diagram
{ "type": "compare", "title": "TCP vs UDP", "left": { "title": "TCP", "items": ["Connection-oriented (handshake)", "Reliable: ACKs + retransmission", "Ordered by sequence numbers", "Flow control via window", "Web, email, file transfer, SSH"] }, "right": { "title": "UDP", "items": ["Connectionless — just send", "Best-effort delivery", "No ordering guarantees", "Minimal 8-byte header", "Voice, video, DNS, DHCP, gaming"] } }
```

```sort
{ "prompt": "Order the TCP connection lifecycle", "items": ["SYN", "SYN-ACK", "ACK (established)", "Data transfer with ACKs", "FIN/ACK teardown"] }
```

```callout
{ "type": "exam", "body": "Beyond the port table, expect: 'which protocol for a voice call?' (UDP), 'which flag starts a connection?' (SYN), 'what provides flow control?' (TCP windowing). If a scenario says 'guaranteed delivery required' — TCP, always." }
```

```quiz
{ "question": "A video conferencing app occasionally loses packets but must minimize latency. Which transport behavior fits, and why?", "options": ["TCP — retransmission recovers the lost video", "UDP — losing a frame is better than pausing to retransmit stale data", "TCP — flow control smooths the video", "Either works identically for real-time media"], "answer": 1, "explanation": "Real-time media is latency-critical: a retransmitted packet arrives after its moment has passed, so TCP's reliability only adds delay. UDP drops-and-continues, which is exactly the right failure mode for live audio/video." }
```
