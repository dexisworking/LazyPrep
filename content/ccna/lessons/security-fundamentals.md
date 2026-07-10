Every network is under constant, automated attack — not personally, just statistically. Security engineering starts with a vocabulary for reasoning about risk and a catalog of the attacks you're defending against. This is that foundation.

## The CIA triad

Every security control protects one or more of three properties:

```diagram
{ "type": "layers", "title": "The CIA triad", "layers": [ { "label": "Confidentiality", "detail": "Only authorized eyes see the data — encryption, access control", "badge": "C" }, { "label": "Integrity", "detail": "Data isn't altered in transit or storage — hashing, signatures", "badge": "I" }, { "label": "Availability", "detail": "Systems stay usable — redundancy, DoS protection, backups", "badge": "A" } ] }
```

Precision vocabulary the exam expects:

- **Vulnerability** — a weakness that *could* be exploited.
- **Exploit** — the tool/technique that weaponizes a vulnerability.
- **Threat** — a potential danger (an actor + an exploit + your vulnerability).
- **Mitigation** — the control that reduces the risk.

## The attack catalog

**Spoofing** — faking an identity: a forged source IP, a cloned MAC, a rogue DHCP server answering before the real one. (Defenses arrive two lessons from now.)

**Denial of Service (DoS)** — exhausting a resource so legitimate users can't use it. The classic **TCP SYN flood**: send endless SYNs, never complete the handshake, fill the server's connection table. **DDoS** = the same from thousands of hijacked machines (a **botnet**).

**Man-in-the-middle (MITM)** — inserting yourself between two parties, reading or altering traffic. On LANs, **ARP spoofing** is the usual vehicle: poison a host's ARP cache so "the gateway's MAC" is actually yours.

**Reconnaissance** — not an attack, but the scouting before one: ping sweeps, port scans, DNS enumeration.

**Malware** — hostile software: **viruses** (attach to files), **worms** (self-propagate across networks), **trojans** (masquerade as legitimate), **ransomware** (encrypt and extort).

```match
{ "prompt": "Match the attack to its category", "pairs": [ { "left": "SYN flood", "right": "DoS — exhausts the connection table" }, { "left": "ARP cache poisoning", "right": "Man-in-the-middle enabler" }, { "left": "Forged source IP", "right": "Spoofing" }, { "left": "Port scan", "right": "Reconnaissance" }, { "left": "Self-spreading malware", "right": "Worm" } ] }
```

## Social engineering — hacking humans

The cheapest exploit is a convincing email. Know the taxonomy:

- **Phishing** — mass fraudulent messages luring credentials/clicks.
- **Spear phishing** — targeted at a specific person or org (far more effective).
- **Whaling** — spear phishing aimed at executives.
- **Vishing / smishing** — the same con over voice calls / SMS.
- **Tailgating** — following an employee through a secured door.

No firewall stops these; **user training** is the mitigation the exam wants.

```callout
{ "type": "exam", "body": "Scenario-to-term matching is the format: 'an attacker sends targeted emails to the finance director' → whaling. 'Thousands of compromised hosts flood a server' → DDoS via botnet. Precision matters — phishing vs SPEAR phishing is a real distinction they test." }
```

## Defense in depth

No single control suffices; real security is **layers** — if one fails, the next catches:

```sort
{ "prompt": "Order these defenses from network edge to the user", "items": ["Edge firewall filters Internet traffic", "IPS inspects what the firewall admits", "Switch port security limits LAN access", "Endpoint antivirus on the host", "Security-aware, trained user"] }
```

```quiz
{ "question": "An attacker floods a web server with TCP SYN packets from randomized source addresses, never completing handshakes. Which attack is this, and what property of CIA does it target?", "options": ["MITM — confidentiality", "SYN flood DoS — availability", "Phishing — integrity", "ARP spoofing — confidentiality"], "answer": 1, "explanation": "Half-open connections exhaust the server's resources until legitimate users are refused — a SYN flood, the textbook DoS. DoS attacks target AVAILABILITY; the data is neither read nor altered." }
```
