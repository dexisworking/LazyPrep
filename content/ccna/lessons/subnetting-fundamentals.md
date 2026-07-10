**Subnetting** is dividing one network into several smaller ones by *borrowing host bits*. It's the single most practical skill on the CCNA — routers, ACLs, OSPF, and troubleshooting all assume you can subnet in your sleep. This lesson builds the concept; the next one makes you fast.

## Why subnet at all?

Take `10.0.0.0/8`: one network, 16 million host addresses. As ONE broadcast domain it's absurd — and it can't map to your real structure of offices, VLANs, and links. Subnetting slices it: one subnet per VLAN, per site, per point-to-point link. Benefits: smaller broadcast domains, clean security boundaries (ACLs match subnets), and organized addressing.

## Borrowing bits

Start with `192.168.1.0/24` — 8 host bits, 256 addresses. **Borrow 2 host bits** for subnetting and the mask grows to /26:

```
/24: NNNNNNNN.NNNNNNNN.NNNNNNNN.HHHHHHHH   1 subnet,  256 addresses
/26: NNNNNNNN.NNNNNNNN.NNNNNNNN.SSHHHHHH   4 subnets,  64 addresses each
```

Two formulas govern everything:

- **Subnets created = 2^(borrowed bits)**
- **Usable hosts per subnet = 2^(remaining host bits) − 2** (minus the network and broadcast addresses)

So /26 → 2² = 4 subnets, 2⁶−2 = **62 usable hosts** each.

```callout
{ "type": "exam", "body": "The −2 matters: every subnet loses its all-zeros (network) and all-ones (broadcast) addresses. A /30 has 4 addresses but only 2 usable — perfect for router-to-router links. (A /31 with exactly 2 addresses is also valid on point-to-point links — modern IOS supports it.)" }
```

## The four values of any subnet

Every subnetting question asks for some of these:

1. **Network address** — host bits all 0. Identifies the subnet.
2. **Broadcast address** — host bits all 1. Last address of the subnet.
3. **First usable host** — network + 1.
4. **Last usable host** — broadcast − 1.

Worked example — `192.168.1.0/26` produces four subnets:

| Subnet | Network | First host | Last host | Broadcast |
|---|---|---|---|---|
| 1 | 192.168.1.0 | .1 | .62 | .63 |
| 2 | 192.168.1.64 | .65 | .126 | .127 |
| 3 | 192.168.1.128 | .129 | .190 | .191 |
| 4 | 192.168.1.192 | .193 | .254 | .255 |

The subnets march upward in steps of **64** — that step is the **block size**, and it's the key to the fast method next lesson.

```sort
{ "prompt": "Order the addresses of a single subnet from lowest to highest", "items": ["Network address (host bits all 0)", "First usable host", "Last usable host", "Broadcast address (host bits all 1)"] }
```

## Mask notation: CIDR and dotted decimal

The same mask, two spellings — you must convert instantly:

| CIDR | Dotted decimal | Block size (last octet) |
|---|---|---|
| /24 | 255.255.255.0 | 256 (whole octet) |
| /25 | 255.255.255.128 | 128 |
| /26 | 255.255.255.192 | 64 |
| /27 | 255.255.255.224 | 32 |
| /28 | 255.255.255.240 | 16 |
| /29 | 255.255.255.248 | 8 |
| /30 | 255.255.255.252 | 4 |

Pattern: each borrowed bit adds the next power of two to the mask octet: 128, 192, 224, 240, 248, 252, 254, 255.

```match
{ "prompt": "Match CIDR to dotted-decimal mask", "pairs": [ { "left": "/26", "right": "255.255.255.192" }, { "left": "/28", "right": "255.255.255.240" }, { "left": "/30", "right": "255.255.255.252" }, { "left": "/27", "right": "255.255.255.224" } ] }
```

```quiz
{ "question": "You subnet 172.16.0.0/16 into /20 subnets. How many subnets and usable hosts per subnet do you get?", "options": ["16 subnets, 4094 hosts", "16 subnets, 4096 hosts", "8 subnets, 8190 hosts", "32 subnets, 2046 hosts"], "answer": 0, "explanation": "Borrowed bits: 20−16 = 4 → 2⁴ = 16 subnets. Remaining host bits: 32−20 = 12 → 2¹² − 2 = 4094 usable hosts. Don't forget the −2!" }
```
