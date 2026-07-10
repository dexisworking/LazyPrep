Before data is packets and frames, it's **electricity on copper**. The physical layer is where networks become tangible — and where a surprising number of real-world outages begin. Let's learn the cables you'll actually plug in.

## UTP — the workhorse

**Unshielded Twisted Pair (UTP)** is the standard LAN cable: 8 copper wires twisted into 4 pairs inside a plastic jacket, ending in **RJ45** connectors.

Why *twisted*? Two reasons, both about noise:

- **EMI (electromagnetic interference)** from motors, lights, and power lines induces unwanted signals; twisting causes the noise to cancel out.
- **Crosstalk** — signals leaking between adjacent pairs — is also reduced by twisting each pair at a different rate.

**STP (shielded twisted pair)** adds foil shielding for electrically noisy environments (factories), at higher cost and stiffness.

## Categories and speeds

Cable **categories** define how much bandwidth the copper can carry cleanly:

| Category | Max speed | Notes |
|---|---|---|
| Cat 5e | 1 Gbps | Minimum you should ever install |
| Cat 6 | 10 Gbps (≤55 m) | Common in new buildings |
| Cat 6a | 10 Gbps (100 m) | Full-distance 10G |
| Cat 8 | 25–40 Gbps (30 m) | Data-center short runs |

```callout
{ "type": "exam", "body": "Ethernet over copper has a 100 meter maximum distance per segment (90 m in the wall + 10 m of patch cables). If a scenario mentions a device 150 m away failing on UTP, the cable length IS the answer — use fiber or add a switch in between." }
```

## Straight-through vs crossover

Inside the cable, which wire ends where matters:

- **Straight-through** — both ends wired identically (T568B on both). Connects *unlike* devices: PC → switch, switch → router.
- **Crossover** — transmit and receive pairs swapped (T568A on one end, T568B on the other). Connects *like* devices: switch → switch, PC → PC, router → router.

Modern gear supports **Auto-MDIX**, which detects and fixes mismatched cabling automatically — but the exam still tests the classic rules.

```match
{ "prompt": "Match the connection to the classic cable type", "pairs": [ { "left": "PC to switch", "right": "Straight-through" }, { "left": "Switch to switch", "right": "Crossover" }, { "left": "Router to switch", "right": "Straight-through (unlike devices)" }, { "left": "PC directly to router", "right": "Crossover (both are 'host-like')" } ] }
```

## Ethernet standards over copper

The naming pattern is `<speed>BASE-T`:

- **100BASE-T** — Fast Ethernet, 100 Mbps
- **1000BASE-T** — Gigabit Ethernet, 1 Gbps (uses all 4 pairs)
- **10GBASE-T** — 10 Gigabit, needs Cat 6a for full distance

**PoE (Power over Ethernet)** delivers electricity over the same pairs as data — how IP phones, cameras, and access points run without wall power. The switch (as **PSE**, power sourcing equipment) negotiates wattage with the **PD** (powered device).

```flip
{ "title": "Copper quick cards", "cards": [ { "front": "Max UTP segment length", "back": "100 meters" }, { "front": "Connector on UTP LAN cable", "back": "RJ45" }, { "front": "Why are pairs twisted?", "back": "To cancel EMI and reduce crosstalk" }, { "front": "Feature that auto-fixes crossover mistakes", "back": "Auto-MDIX" } ] }
```

```quiz
{ "question": "A technician runs Cat 5e from a switch to a desk 130 meters away. The link is flapping. What's the most likely cause?", "options": ["Cat 5e can't carry gigabit", "The run exceeds the 100 m copper limit", "RJ45 connectors don't support that speed", "Auto-MDIX is disabled"], "answer": 1, "explanation": "Cat 5e handles gigabit fine — but ALL copper Ethernet is limited to 100 meters per segment. Beyond that, signals degrade: use fiber or place an intermediate switch." }
```
