Fixed-size subnetting cuts a network into equal pieces — but real networks aren't equal. A campus VLAN needs 200 addresses; a router-to-router link needs exactly 2. **VLSM (Variable Length Subnet Masking)** lets every subnet be exactly as big as it needs to be.

## The waste problem

Say you have `192.168.1.0/24` and need: Sales (100 hosts), Engineering (50), Guest Wi-Fi (20), and two WAN links (2 each). Equal /26 slices (62 hosts each) fail immediately: Sales doesn't fit, and each WAN link wastes 60 addresses.

## The VLSM algorithm

One rule makes VLSM foolproof:

```diagram
{ "type": "flow", "title": "VLSM allocation", "direction": "vertical", "steps": [ { "label": "1. Sort requirements LARGEST first", "detail": "Big blocks must align to big boundaries — placing them first avoids overlap" }, { "label": "2. Size each subnet", "detail": "Smallest mask whose usable hosts ≥ the need" }, { "label": "3. Allocate sequentially", "detail": "Each new subnet starts right after the previous one ends" }, { "label": "4. Verify no overlaps", "detail": "Every allocation begins on a multiple of its own block size" } ] }
```

## Worked example

Requirements sorted: Sales 100 → Engineering 50 → Guest 20 → WAN×2.

| Need | Hosts req. | Mask | Block | Allocation | Usable |
|---|---|---|---|---|---|
| Sales | 100 | /25 (126) | 128 | 192.168.1.**0**/25 | .1–.126 |
| Engineering | 50 | /26 (62) | 64 | 192.168.1.**128**/26 | .129–.190 |
| Guest | 20 | /27 (30) | 32 | 192.168.1.**192**/27 | .193–.222 |
| WAN-1 | 2 | /30 (2) | 4 | 192.168.1.**224**/30 | .225–.226 |
| WAN-2 | 2 | /30 (2) | 4 | 192.168.1.**228**/30 | .229–.230 |

Everything fits in one /24 with room to spare (.232–.255 still free). Try that with fixed-size subnets.

```callout
{ "type": "warning", "body": "The classic VLSM mistake: allocating a smaller subnet first, then discovering the next big one doesn't start on a valid boundary (e.g. trying to place a /25 at .32 — impossible, /25 blocks start only at .0 or .128). LARGEST FIRST prevents this structurally." }
```

```sort
{ "prompt": "Order these subnet requests for correct VLSM allocation", "items": ["Data center VLAN — 500 hosts", "Office VLAN — 120 hosts", "IoT VLAN — 40 hosts", "Management VLAN — 10 hosts", "Point-to-point link — 2 hosts"] }
```

## Route summarization — VLSM's mirror twin

VLSM splits; **summarization** merges. Contiguous subnets can be advertised as one shorter prefix: the four networks `10.1.0.0/24` through `10.1.3.0/24` share their first 22 bits → advertise just `10.1.0.0/22`. Routing tables shrink, and a flapping subnet inside the summary no longer churns distant routers.

```flip
{ "title": "Summarization check", "cards": [ { "front": "Summarize 192.168.0.0/24 + 192.168.1.0/24", "back": "192.168.0.0/23 (they differ only in bit 24)" }, { "front": "Summarize 10.1.4.0/24 – 10.1.7.0/24", "back": "10.1.4.0/22 (4 nets = 2 bits shorter)" }, { "front": "What does 0.0.0.0/0 summarize?", "back": "Every network — it's the default route" } ] }
```

```quiz
{ "question": "Using VLSM on 172.16.4.0/24, you place a /25 for 120 hosts at .0. Where can the NEXT subnet (a /26 for 60 hosts) legally start?", "options": ["172.16.4.64", "172.16.4.126", "172.16.4.128", "172.16.4.100"], "answer": 2, "explanation": "The /25 occupies .0–.127. The next free address is .128 — which is also a valid /26 boundary (multiples of 64: 0, 64, 128, 192). So 172.16.4.128/26 is correct." }
```
