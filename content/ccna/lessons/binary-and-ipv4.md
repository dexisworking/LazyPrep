Subnetting is the skill that makes or breaks CCNA candidates — and subnetting is just **binary arithmetic wearing a network costume**. Invest fifteen minutes here and the next three lessons become mechanical.

## An IPv4 address is 32 bits

`192.168.10.25` looks like four numbers, but it's really **32 bits** split into four **octets** (8 bits each), each written in decimal:

```
192      .168      .10       .25
11000000 .10101000 .00001010 .00011001
```

Each octet ranges **0–255** — because 8 bits can express 2⁸ = 256 values.

## Reading binary: the place values

Each bit position in an octet has a value, doubling right-to-left:

| Bit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Value | **128** | **64** | **32** | **16** | **8** | **4** | **2** | **1** |

Binary → decimal: add the values where a 1 appears.
`11000000` = 128 + 64 = **192**. `00011001` = 16 + 8 + 1 = **25**.

Decimal → binary: subtract place values greatest-first.
`168` → 128 fits (remainder 40) → 64 no → 32 fits (8) → 16 no → 8 fits (0) → `10101000`.

```match
{ "prompt": "Match the binary octet to its decimal value", "pairs": [ { "left": "11111111", "right": "255" }, { "left": "10000000", "right": "128" }, { "left": "11000000", "right": "192" }, { "left": "11100000", "right": "224" }, { "left": "10101000", "right": "168" } ] }
```

## The powers of two you must own

Subnetting questions are answered in seconds by people who know this table cold:

| 2¹ | 2² | 2³ | 2⁴ | 2⁵ | 2⁶ | 2⁷ | 2⁸ | 2⁹ | 2¹⁰ |
|---|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 |

```callout
{ "type": "tip", "body": "Drill until instant: 'How many values do 5 bits give?' → 32. 'How many bits for 100 hosts?' → 7 bits (128, since 64 is too few). Every subnetting problem reduces to one of these two questions." }
```

## Network part, host part

Here's the payoff. An IP address has two components packed into its 32 bits:

```diagram
{ "type": "flow", "title": "192.168.10.25 /24 — split by the mask", "steps": [ { "label": "Network portion", "detail": "First 24 bits: 192.168.10 — WHICH network" }, { "label": "Host portion", "detail": "Last 8 bits: .25 — WHICH device on it" } ] }
```

The **subnet mask** marks the boundary: binary 1s over the network part, 0s over the host part. `/24` means "first 24 bits are network":

```
Address: 11000000.10101000.00001010.00011001  = 192.168.10.25
Mask:    11111111.11111111.11111111.00000000  = 255.255.255.0
```

Two devices are on the **same network** exactly when their network bits match. That's the comparison every host makes before sending (remember ARP: same net → direct, different net → gateway).

```sort
{ "prompt": "Order the steps a host takes to decide where to send a packet", "items": ["AND its own IP with its subnet mask → my network", "AND the destination IP with the same mask → their network", "Compare the two network values", "Match → send direct; differ → send to default gateway"] }
```

```quiz
{ "question": "Host A is 10.1.1.20/24 and Host B is 10.1.2.20/24. Host A wants to send to B. What does A conclude?", "options": ["Same network — ARP for B directly", "Different networks — send to the default gateway", "Same network — because both start with 10", "It can't decide without DNS"], "answer": 1, "explanation": "With /24, the first three octets are the network: 10.1.1 vs 10.1.2 differ, so these are different networks. A frames the packet to its gateway. (The '10.' start would only matter with a /8 mask.)" }
```
