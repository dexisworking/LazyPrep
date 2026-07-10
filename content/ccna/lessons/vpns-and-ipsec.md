The Internet is a public place, yet companies move payroll and trade secrets across it daily. The trick is the **VPN (Virtual Private Network)** — an encrypted tunnel that makes hostile territory behave like a private line. This lesson covers the two VPN families and the cryptography vocabulary the exam expects.

## Two VPN families

```diagram
{ "type": "compare", "title": "Site-to-site vs Remote-access VPN", "left": { "title": "Site-to-site", "items": ["Router/firewall to router/firewall", "Connects whole NETWORKS (branch ↔ HQ)", "Always on; hosts don't know it exists", "Typically IPsec"] }, "right": { "title": "Remote-access", "items": ["Laptop/phone to a VPN gateway", "Connects one USER to the network", "Client software (e.g. AnyConnect/Secure Client)", "Typically TLS/SSL — or IPsec"] } }
```

## IPsec — the site-to-site standard

**IPsec** is a framework of protocols securing IP traffic. What it provides maps straight onto security goals:

- **Confidentiality** — payload encryption (AES today; DES/3DES are history).
- **Integrity** — hashing (SHA family) proves nothing was altered.
- **Authentication** — pre-shared keys or certificates prove *who's* at each end.
- **Anti-replay** — sequence numbers stop captured packets being resent.

The pieces worth naming:

- **IKE (Internet Key Exchange)** negotiates the tunnel: peers authenticate, agree on algorithms, and derive session keys (using **Diffie-Hellman** to agree on secrets over a public channel).
- **ESP (Encapsulating Security Payload)** carries the encrypted data. (Its sibling **AH** offers integrity without encryption — rarely used.)
- **Tunnel mode** wraps the *entire original packet* inside a new IP header — the standard for site-to-site.

```diagram
{ "type": "flow", "title": "An IPsec site-to-site tunnel is born", "steps": [ { "label": "IKE Phase 1", "detail": "Peers authenticate, build a secure control channel" }, { "label": "IKE Phase 2", "detail": "Negotiate the data tunnel (the IPsec SAs)" }, { "label": "ESP data flow", "detail": "Original packets encrypted + wrapped in new headers" } ] }
```

One classic limitation: plain IPsec can't carry **multicast** — which routing protocols use. Cisco's fix is **GRE over IPsec**: a GRE tunnel (which carries anything) wrapped in IPsec encryption. "Run OSPF between sites over the Internet, securely" → GRE over IPsec.

## TLS — the remote-access (and web) workhorse

**TLS (Transport Layer Security)** secures HTTPS and most remote-access VPNs. Client-friendly (no special L3 plumbing; runs over TCP 443, which every network allows), certificate-authenticated, and the reason browser padlocks exist. When the exam says "SSL VPN," think TLS-based remote access through a browser or client.

## Crypto vocabulary in 60 seconds

```match
{ "prompt": "Match the primitive to its job", "pairs": [ { "left": "Symmetric encryption (AES)", "right": "Fast bulk data confidentiality — one shared key" }, { "left": "Asymmetric crypto (RSA)", "right": "Key exchange & signatures — public/private pair" }, { "left": "Hash (SHA-256)", "right": "Integrity fingerprint — one-way, fixed length" }, { "left": "Diffie-Hellman", "right": "Agreeing on a secret over a public channel" } ] }
```

```callout
{ "type": "exam", "body": "Map scenarios to VPN types: 'connect 30 branch offices' → site-to-site IPsec; 'traveling employees on laptops' → remote-access TLS; 'routing protocol across the VPN' → GRE over IPsec. And IPsec's services: confidentiality, integrity, authentication, anti-replay — all four." }
```

```quiz
{ "question": "A company must run OSPF between HQ and a branch across the Internet, encrypted. Plain IPsec alone won't work. Why, and what's the fix?", "options": ["IPsec is too slow for OSPF; use TLS", "IPsec can't carry multicast (OSPF hellos); wrap a GRE tunnel inside IPsec", "OSPF refuses to run over WANs; use static routes", "The fix is running OSPF over TCP"], "answer": 1, "explanation": "OSPF relies on multicast (224.0.0.5/6), which classic IPsec tunnels don't transport. GRE encapsulates any traffic — multicast included — into unicast packets that IPsec then encrypts: GRE over IPsec, the standard answer." }
```
