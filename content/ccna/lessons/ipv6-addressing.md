IPv4 offers about 4.3 billion addresses; humanity connected more devices than that years ago. **IPv6** is the permanent fix: **128-bit addresses** — 340 undecillion of them, enough to address every grain of sand with room left over. It's also a cleaner protocol, and the CCNA expects fluency.

## Anatomy of an IPv6 address

128 bits, written as **eight groups of four hex digits** (each group = 16 bits, a "hextet"):

```
2001:0db8:0000:0000:0000:ff00:0042:8329
```

Hex digits 0–f, each representing 4 bits. Get comfortable: `f` = 1111, `a` = 1010.

## The two shortening rules

Full addresses are unwieldy; two rules compress them:

1. **Drop leading zeros** in each group: `0db8` → `db8`, `0042` → `42`.
2. **Replace ONE run of consecutive all-zero groups with `::`** — only once per address (twice would be ambiguous).

```diagram
{ "type": "flow", "title": "Compressing 2001:0db8:0000:0000:0000:ff00:0042:8329", "steps": [ { "label": "Drop leading zeros", "detail": "2001:db8:0:0:0:ff00:42:8329" }, { "label": "Collapse the zero run with ::", "detail": "2001:db8::ff00:42:8329" } ] }
```

```callout
{ "type": "exam", "body": "The :: rule is heavily tested. If an address has TWO separate zero runs (2001:0:0:1:0:0:0:5), :: may replace only ONE — and best practice (RFC 5952) says the LONGEST run: 2001:0:0:1::5. Expanding a compressed address back to 8 groups is equally fair game." }
```

```match
{ "prompt": "Match the compressed form to the full address", "pairs": [ { "left": "::1", "right": "0000:…:0000:0001 — loopback" }, { "left": "2001:db8::5", "right": "2001:0db8:0000:0000:0000:0000:0000:0005" }, { "left": "fe80::1a2b", "right": "fe80:0000:0000:0000:0000:0000:0000:1a2b" }, { "left": "::", "right": "All zeros — the unspecified address" } ] }
```

## Prefixes without the pain

IPv6 uses CIDR notation, and the standard layout makes subnetting *easier* than IPv4:

- Your ISP delegates a site prefix, e.g. `2001:db8:acad::/48`.
- The next **16 bits** are your subnet field → 65,536 subnets.
- The final **64 bits** are always the host portion (the **interface ID**).

So a typical LAN is a **/64**, and subnetting is just counting in hex in the 4th hextet: `2001:db8:acad:0001::/64`, `2001:db8:acad:0002::/64`… No block sizes, no −2 (IPv6 subnets don't reserve network/broadcast addresses — there's no broadcast at all).

## No broadcast — multicast instead

IPv6 deliberately has **no broadcast**. What broadcast did, **multicast** does more politely:

- `ff02::1` — all nodes on the link (the closest thing to broadcast)
- `ff02::2` — all routers on the link
- Solicited-node multicast — the targeted mechanism behind address resolution (NDP replaces ARP — next lesson)

```flip
{ "title": "IPv6 vs IPv4 quick contrasts", "cards": [ { "front": "Address length?", "back": "128 bits vs IPv4's 32" }, { "front": "Broadcast?", "back": "Gone — replaced by multicast (ff02::1 = all nodes)" }, { "front": "Typical LAN prefix?", "back": "/64 — always, by convention" }, { "front": "Loopback?", "back": "::1 (vs 127.0.0.1)" } ] }
```

```quiz
{ "question": "Which compression of 2001:0db8:0000:0000:0d0a:0000:0000:0001 is INVALID?", "options": ["2001:db8::d0a:0:0:1", "2001:db8:0:0:d0a::1", "2001:db8::d0a::1", "2001:db8:0:0:d0a:0:0:1"], "answer": 2, "explanation": "Using :: TWICE is illegal — a parser couldn't tell how many zero groups each :: hides. Options A and B each compress one run (RFC 5952 prefers the first when runs tie), and D simply drops leading zeros without :: — all valid." }
```
