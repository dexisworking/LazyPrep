Copper hits a wall at 100 meters. When you need to cross a campus, a city, or an ocean — or escape electrical interference entirely — you switch media: **light in glass** or **radio through air**.

## Fiber optics — data as light

A fiber cable carries pulses of light down a hair-thin glass core. No electrons, so:

- **Immunity to EMI** — run it beside power cables, in factories, anywhere.
- **Distance** — kilometers instead of meters.
- **Bandwidth** — the same glass installed today can carry faster optics tomorrow.

### Single-mode vs multimode

The core diameter defines the two families:

```diagram
{ "type": "compare", "title": "Multimode vs Single-mode fiber", "left": { "title": "Multimode (MMF)", "items": ["Wider core (50/62.5 µm) — light bounces in multiple paths", "Cheaper LED/VCSEL transmitters", "Up to ~550 m (Gigabit) / ~400 m (10G)", "Inside buildings & data centers"] }, "right": { "title": "Single-mode (SMF)", "items": ["Tiny core (~9 µm) — one straight light path", "Laser transmitters (pricier optics)", "Kilometers — 10 km, 40 km, more", "Between buildings, cities, continents"] } }
```

Rule of thumb: **multimode within a building, single-mode between buildings**.

### Transceivers

Fiber plugs into switches via hot-swappable **transceiver modules** — **SFP** (1G), **SFP+** (10G), **QSFP** (40/100G). The switch port is generic; the module you insert decides speed, fiber type, and reach. Mismatched transceivers (or dirty connectors — seriously) are classic real-world failures.

```callout
{ "type": "tip", "body": "Fiber links have a transmit and a receive strand. If a brand-new fiber link stays down, the #1 field fix is swapping the two strands at one end — TX must meet RX." }
```

## Wireless — data as radio

Wi-Fi (**IEEE 802.11**) turns the air into shared media. Key physical-layer facts (the full wireless module comes later):

- Operates in **2.4 GHz** (longer reach, more interference, 3 usable channels) and **5/6 GHz** (faster, shorter reach, many channels).
- The medium is **half-duplex and shared** — clients take turns; more clients = less airtime each.
- Walls, water, and microwaves degrade it. Radio is physics, not magic.

```sort
{ "prompt": "Order these media by realistic maximum distance, shortest first", "items": ["UTP copper (100 m)", "Multimode fiber (~550 m)", "Single-mode fiber (tens of km)"] }
```

## Choosing media — the engineer's checklist

1. **Distance** — >100 m? Fiber (or wireless bridge).
2. **Interference** — electrically hostile? Fiber or STP.
3. **Bandwidth roadmap** — pulling cable is expensive; pull the best you can.
4. **Mobility** — humans with laptops? Wireless, backed by wired APs.

```quiz
{ "question": "You must link two campus buildings 2 km apart. Which medium fits?", "options": ["Cat 6a UTP", "Multimode fiber", "Single-mode fiber", "Bluetooth"], "answer": 2, "explanation": "2 km exceeds copper (100 m) and multimode (~550 m) limits. Single-mode fiber routinely spans kilometers — it's the standard choice for building-to-building runs of this distance." }
```
