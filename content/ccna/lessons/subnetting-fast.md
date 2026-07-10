On the exam you get roughly 90 seconds per question — including multi-part subnetting scenarios. This lesson turns the theory into a **10-second mechanical method**. Practice it until your hands do it without your brain.

## The magic number method

For any address + mask, three steps:

```diagram
{ "type": "flow", "title": "The 10-second subnet solve", "steps": [ { "label": "1. Find the interesting octet", "detail": "The mask octet that isn't 255 or 0" }, { "label": "2. Magic number = 256 − mask value", "detail": "e.g. 256 − 224 = 32 → subnets step by 32" }, { "label": "3. Walk the multiples", "detail": "Find the multiple ≤ your address: that's the network; next multiple − 1 is the broadcast" } ] }
```

**Example:** which subnet contains `192.168.1.77/27`?

1. /27 → `255.255.255.224` → interesting octet = 4th, value 224.
2. Magic number: 256 − 224 = **32**. Subnets: 0, 32, 64, 96, 128…
3. 77 falls between 64 and 96 → **network 192.168.1.64**, **broadcast .95**, usable **.65–.94**.

Ten seconds, no binary.

## When the interesting octet isn't the last

`172.16.57.99/20` → mask `255.255.240.0` → interesting octet = **3rd**, value 240 → magic number 16. Third-octet multiples: 0, 16, 32, 48, **57 sits past 48** → network `172.16.48.0`, broadcast `172.16.63.255` (one less than 64.0), hosts `.48.1 – .63.254`.

The 4th octet just rides along: full range in the network/broadcast.

```quiz
{ "question": "What subnet does host 10.1.37.14/19 belong to?", "options": ["10.1.0.0", "10.1.32.0", "10.1.36.0", "10.1.37.0"], "answer": 1, "explanation": "/19 → 255.255.224.0 → magic number 256−224 = 32 in the THIRD octet. Multiples: 0, 32, 64… 37 falls in the 32 block → network 10.1.32.0/19, broadcast 10.1.63.255." }
```

## Designing subnets: two directions

Exam design questions come in two flavors — know which formula each needs:

- **"I need X subnets"** → borrow bits until 2^borrowed ≥ X.
- **"I need X hosts per subnet"** → keep host bits until 2^host − 2 ≥ X.

**Example:** from `192.168.10.0/24`, you need subnets of **at least 50 hosts**. Host bits: 2⁶−2 = 62 ≥ 50 → keep **6** host bits → mask **/26** → 4 subnets of 62. Done.

```callout
{ "type": "exam", "body": "Careful reading wins points: 'need 60 HOSTS per subnet' and 'need 60 SUBNETS' produce different masks from the same /24 (/26 vs /30... actually 60 subnets needs 6 borrowed bits = /30). Underline which quantity the question fixes." }
```

## Drill set

Run these mentally — answers in the flip cards:

```flip
{ "title": "Speed drills — solve before flipping", "cards": [ { "front": "Network & broadcast for 192.168.4.130/26?", "back": "Network .128, broadcast .191 (block 64: 0,64,128,192)" }, { "front": "Usable range of 10.0.0.0/30?", "back": ".1 and .2 only (network .0, broadcast .3)" }, { "front": "Smallest mask for 100 hosts?", "back": "/25 → 126 usable (/26 gives only 62)" }, { "front": "How many /28s fit in a /24?", "back": "16 (4 borrowed bits → 2⁴)" }, { "front": "172.20.200.10/21 — its network?", "back": "172.20.200.0 (block 8 in 3rd octet: …192, 200, 208)" } ] }
```

```sort
{ "prompt": "Order the magic-number workflow for 192.168.1.77/27", "items": ["Mask /27 → 255.255.255.224", "Magic number 256 − 224 = 32", "Multiples of 32: 0, 32, 64, 96…", "77 falls in the 64 block → network .64", "Broadcast .95; hosts .65–.94"] }
```

```quiz
{ "question": "You must split 172.16.0.0/22 into subnets supporting at least 200 hosts each. Which mask maximizes the subnet count?", "options": ["/23", "/24", "/25", "/26"], "answer": 1, "explanation": "200 hosts needs 2⁸−2 = 254 (8 host bits) since 7 bits gives only 126. Keep 8 host bits → /24. From a /22 that yields 4 subnets of 254 hosts." }
```
