Wireless traffic is radio — anyone in the parking lot receives it. The only privacy is cryptography, and Wi-Fi's crypto has a colorful history of getting broken and rebuilt. The CCNA wants the whole evolution, because you'll still meet every generation in the wild.

## The evolution of Wi-Fi security

```diagram
{ "type": "layers", "title": "Wi-Fi security through the ages", "layers": [ { "label": "Open", "detail": "No encryption at all — coffee-shop classic", "badge": "☠" }, { "label": "WEP (1997)", "detail": "RC4, broken beyond repair — crackable in minutes", "badge": "✗" }, { "label": "WPA (2003)", "detail": "TKIP stopgap on old hardware — also retired", "badge": "△" }, { "label": "WPA2 (2004)", "detail": "AES-CCMP — the two-decade workhorse", "badge": "✓" }, { "label": "WPA3 (2018)", "detail": "SAE handshake, forward secrecy — the current standard", "badge": "✓✓" } ] }
```

- **WEP** — static keys and flawed RC4 usage; tools crack it in minutes. Never deploy; recognize it as the "wrong answer" in scenarios.
- **WPA** — TKIP wrapped around WEP-era hardware as an emergency patch. Deprecated.
- **WPA2** — real **AES-CCMP** encryption. Solid, but its 4-way handshake permits offline dictionary attacks against weak passphrases (and KRACK bruised it).
- **WPA3** — replaces the PSK handshake with **SAE** (Simultaneous Authentication of Equals): resistant to offline guessing, adds **forward secrecy** (captured traffic can't be decrypted later even if the password leaks), and offers OWE ("Enhanced Open") to encrypt even open networks.

```sort
{ "prompt": "Order the Wi-Fi security protocols from oldest/weakest to newest/strongest", "items": ["WEP", "WPA (TKIP)", "WPA2 (AES-CCMP)", "WPA3 (SAE)"] }
```

## Personal vs Enterprise mode

Every WPA generation comes in two authentication flavors:

```diagram
{ "type": "compare", "title": "Personal vs Enterprise", "left": { "title": "Personal (PSK)", "items": ["One shared passphrase for everyone", "Simple — homes, small offices", "Leaver problem: ex-employee still knows the key", "WPA3-Personal upgrades PSK to SAE"] }, "right": { "title": "Enterprise (802.1X)", "items": ["Per-user credentials via RADIUS", "EAP authentication framework", "Revoke one user without touching others", "The standard for organizations"] } }
```

**802.1X roles** (same trio as wired): the client is the **supplicant**, the AP/WLC the **authenticator**, and the **RADIUS server** decides. EAP methods (PEAP, EAP-TLS) carry the actual credential exchange — EAP-TLS with certificates being the gold standard.

## Configuring a WLAN (WLC-style)

On a controller you bind: an **SSID** → a **security policy** (WPA2/WPA3, PSK or 802.1X) → an **interface/VLAN**. Guest networks get an isolated VLAN and often a captive portal; corporate SSIDs get 802.1X and land on internal VLANs. One physical AP infrastructure, multiple logically separate networks.

```match
{ "prompt": "Match the technology to the fact", "pairs": [ { "left": "SAE", "right": "WPA3's handshake — kills offline dictionary attacks" }, { "left": "AES-CCMP", "right": "WPA2's encryption engine" }, { "left": "802.1X + RADIUS", "right": "Per-user enterprise authentication" }, { "left": "TKIP", "right": "WPA1's deprecated stopgap cipher" } ] }
```

```callout
{ "type": "exam", "body": "Two reliable questions: 'most secure option?' — WPA3 (SAE, forward secrecy); 'company needs per-user wireless auth' — WPA2/3-ENTERPRISE with 802.1X/RADIUS, never PSK. Bonus trivia: WPA3-Personal still uses a passphrase but exchanges it via SAE, not the old 4-way PSK handshake." }
```

```quiz
{ "question": "A company on WPA2-Personal fires an employee. What's the security problem, and what design eliminates it?", "options": ["Nothing — WPA2 handles revocation", "The ex-employee knows the shared passphrase; only rotating it (disrupting everyone) locks them out — 802.1X Enterprise gives per-user credentials you can revoke individually", "Switch to WEP with MAC filtering", "Hide the SSID"], "answer": 1, "explanation": "PSK means one secret shared by all — revoking one person requires changing it everywhere. Enterprise mode authenticates each user against RADIUS, so disabling one account removes one person's access. (Hidden SSIDs and MAC filters are trivially bypassed.)" }
```
