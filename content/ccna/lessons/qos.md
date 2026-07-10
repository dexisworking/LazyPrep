On a congested link, someone's packets wait. **QoS (Quality of Service)** decides *whose* — making sure a voice call's packets jump the queue while a backup transfer politely waits. Without it, one big download makes every phone call robotic.

## Why voice and video need special treatment

Real-time media has three enemies, and QoS fights all of them:

- **Delay (latency)** — one-way time. Voice needs **< 150 ms** or conversations start colliding.
- **Jitter** — *variation* in delay (< 30 ms target). Choppy audio is usually jitter.
- **Loss** — voice tolerates ~1% before quality craters; unlike TCP data, lost voice is never retransmitted.

A 10-second buffer hides all three for YouTube. A live call has no such luxury — its packets must win *now*.

## The QoS toolchain

```diagram
{ "type": "flow", "title": "A packet through QoS", "steps": [ { "label": "Classify", "detail": "What is this? (voice? video? bulk?)" }, { "label": "Mark", "detail": "Stamp the class into the header (DSCP)" }, { "label": "Queue", "detail": "Separate lines per class at each interface" }, { "label": "Schedule", "detail": "Serve queues by policy; police/shape excess" } ] }
```

**Classification & marking.** Identify traffic (by port, application, source) and write its class into the IP header's **DSCP field** (6 bits, 64 values). Standard markings: **EF (Expedited Forwarding, 46)** = voice; **AF** classes = tiered data; **0 (best effort)** = everything else. Mark once, near the source — every downstream device just reads the tag.

**Queuing.** Each interface holds multiple queues. **LLQ (Low Latency Queuing)** gives voice a **priority queue**: if a voice packet is waiting, it goes next, full stop. Other classes share leftover bandwidth via **CBWFQ** (weighted fair queuing per class).

**Policing vs shaping** — the pair everyone confuses:

```diagram
{ "type": "compare", "title": "Policing vs Shaping", "left": { "title": "Policing", "items": ["Excess traffic is DROPPED (or re-marked)", "No added delay, no buffer", "Enforces a hard ceiling", "Typical: provider limits your ingress"] }, "right": { "title": "Shaping", "items": ["Excess traffic is BUFFERED and delayed", "Smooths bursts to a target rate", "Gentler — data survives, just later", "Typical: you conform to provider's rate"] } }
```

```callout
{ "type": "exam", "body": "Memorize: police = drop, shape = delay/buffer. Voice gets EF (DSCP 46) and a PRIORITY queue (LLQ). Trust boundary = the point where markings are accepted (usually the IP phone) — beyond it, markings from PCs are rewritten." }
```

## The trust boundary

Any laptop can mark its own packets EF and demand first-class treatment. So switches define a **trust boundary**: markings from the IP phone are trusted; markings from the PC plugged into the phone's back port are reset to 0. QoS is a policy system — and policies need borders.

```match
{ "prompt": "Match the QoS mechanism to its behavior", "pairs": [ { "left": "LLQ priority queue", "right": "Voice always transmits first" }, { "left": "Policing", "right": "Excess traffic dropped at a rate cap" }, { "left": "Shaping", "right": "Excess traffic buffered and smoothed" }, { "left": "DSCP EF (46)", "right": "The standard voice marking" } ] }
```

```quiz
{ "question": "Users report choppy voice during backups. Investigation shows voice packets arriving with wildly varying delay. What is the symptom called, and which tool most directly fixes it?", "options": ["Loss — increase link bandwidth", "Jitter — give voice a priority queue (LLQ)", "Latency — enable policing on voice", "Serialization — enable shaping on voice"], "answer": 1, "explanation": "Variation in arrival delay is jitter — the classic symptom of voice queued behind bursty data. A priority queue ensures voice packets never wait behind the backup traffic, stabilizing their timing." }
```
