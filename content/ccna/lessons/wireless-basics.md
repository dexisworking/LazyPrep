Wi-Fi looks like magic and behaves like physics. Underneath every "just works" wireless connection is radio engineering — frequencies, channels, and standards — and the CCNA expects you to speak that language fluently.

## Radio fundamentals

Wi-Fi (**IEEE 802.11**) transmits data as radio waves in **unlicensed** spectrum — free for anyone, which is both its gift (ubiquity) and curse (interference). Three bands matter:

| Band | Range | Speed | Congestion |
|---|---|---|---|
| **2.4 GHz** | Longest, best wall penetration | Lowest | Terrible (microwaves, Bluetooth, neighbors) |
| **5 GHz** | Medium | High | Moderate — many channels |
| **6 GHz** (Wi-Fi 6E/7) | Shortest | Highest | Clean — new spectrum |

Lower frequency = longer reach; higher frequency = more data. Everything in wireless design is negotiating that trade.

## Channels — and the sacred 1, 6, 11

Each band divides into **channels**. In 2.4 GHz, channels are 5 MHz apart but signals are ~20 MHz wide — so most channels **overlap** their neighbors. Only **1, 6, and 11** coexist without interfering:

```diagram
{ "type": "flow", "title": "2.4 GHz non-overlapping channel plan", "steps": [ { "label": "Channel 1", "detail": "AP in the west wing" }, { "label": "Channel 6", "detail": "AP in the lobby — no overlap with 1" }, { "label": "Channel 11", "detail": "AP in the east wing — no overlap with 6" } ] }
```

Adjacent APs on the *same* channel share airtime (co-channel interference); on *overlapping* channels (say 3 and 5) they corrupt each other — worse. 5/6 GHz have many non-overlapping channels, which is why modern designs push clients there.

```callout
{ "type": "exam", "body": "\"Which 2.4 GHz channels should adjacent APs use?\" → 1, 6, 11. Any other answer creates overlap. This might be the single most reliable wireless question in the pool." }
```

## Half-duplex, shared, and CSMA/CA

Radio can't transmit and listen simultaneously on one channel — wireless is **half-duplex**, and all devices on a channel share it. Ethernet's collision *detection* is impossible over radio, so Wi-Fi uses **CSMA/CA — collision avoidance**: listen first, wait a random backoff, transmit, and require an **ACK** for every frame. No ACK = assume collision = retry. Overhead, but it works.

## The 802.11 alphabet

| Standard | Marketing name | Band | Max (theoretical) |
|---|---|---|---|
| 802.11n | Wi-Fi 4 | 2.4 + 5 | 600 Mbps |
| 802.11ac | Wi-Fi 5 | 5 | ~3.5 Gbps |
| 802.11ax | **Wi-Fi 6/6E** | 2.4 + 5 (+6) | ~9.6 Gbps |
| 802.11be | Wi-Fi 7 | all three | ~46 Gbps |

Key tech along the way: **MIMO** (multiple antennas, multiple simultaneous streams), **MU-MIMO** (serve several clients at once), **OFDMA** (Wi-Fi 6: subdivide a channel among clients — efficiency in dense spaces).

```match
{ "prompt": "Match the term to its meaning", "pairs": [ { "left": "CSMA/CA", "right": "Listen, back off, transmit, expect ACK" }, { "left": "MIMO", "right": "Multiple antennas, multiple spatial streams" }, { "left": "Wi-Fi 6", "right": "802.11ax — OFDMA, 6 GHz in 6E" }, { "left": "Co-channel interference", "right": "Nearby APs sharing one channel's airtime" } ] }
```

```quiz
{ "question": "A café's three APs sit on 2.4 GHz channels 1, 3, and 5. Users complain constantly. What's the core problem?", "options": ["2.4 GHz can't support three APs", "Channels 3 and 5 overlap with their neighbors, corrupting transmissions", "The APs need Wi-Fi 7", "Too many SSIDs"], "answer": 1, "explanation": "In 2.4 GHz only 1, 6, and 11 are non-overlapping. Channels 3 and 5 partially overlap 1 AND 6 — adjacent-channel interference that devices can't coordinate around. Re-plan to 1/6/11." }
```
