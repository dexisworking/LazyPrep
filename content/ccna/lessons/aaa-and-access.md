Your routers and switches are the keys to the kingdom — and by default they ship wide open. Securing *access to the devices themselves* is where practical network security begins: passwords done right, AAA done centrally, and management traffic encrypted.

## Local password hygiene

The baseline every Cisco device deserves:

```term
R1(config)# enable secret StrongPass123!
R1(config)# service password-encryption
R1(config)# username admin secret AdminPass456!
R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# transport input ssh
```

- `enable secret` hashes the privileged-exec password (MD5+; modern IOS supports scrypt via `algorithm-type`). The legacy `enable password` stores **cleartext** — never use it.
- `service password-encryption` applies weak (type 7, trivially reversible) obfuscation to line passwords — better than nothing, not real security. The exam wants you to know it's cosmetic.
- `login local` + `username ... secret` = per-user accounts instead of one shared line password.

## SSH, never Telnet

**Telnet sends everything — passwords included — in cleartext.** SSH encrypts the session. Enabling it:

```term
R1(config)# hostname R1
R1(config)# ip domain name corp.local
R1(config)# crypto key generate rsa modulus 2048
R1(config)# ip ssh version 2
```

The RSA keypair requires a hostname + domain name first — a favorite exam dependency question. `transport input ssh` on the VTY lines then bans Telnet outright.

```sort
{ "prompt": "Order the steps to enable SSH on a Cisco device", "items": ["Set hostname and ip domain name", "Generate the RSA keypair (crypto key generate rsa)", "Create a local username/secret", "Restrict VTY lines: login local + transport input ssh"] }
```

## AAA — centralized control

Local accounts don't scale past a handful of devices. **AAA** centralizes the three questions:

- **Authentication** — *who are you?* (credentials, MFA)
- **Authorization** — *what may you do?* (privilege levels, per-command control)
- **Accounting** — *what did you do?* (audit logs of every session/command)

Devices ask a central server via one of two protocols:

```diagram
{ "type": "compare", "title": "RADIUS vs TACACS+", "left": { "title": "RADIUS", "items": ["Open standard — UDP 1812/1813", "Encrypts ONLY the password field", "Auth + authorization combined", "The choice for NETWORK access (Wi-Fi, VPN, 802.1X)"] }, "right": { "title": "TACACS+", "items": ["Cisco-origin — TCP 49", "Encrypts the ENTIRE payload", "Separates all three A's — per-command authorization", "The choice for DEVICE administration"] } }
```

```callout
{ "type": "exam", "body": "The RADIUS vs TACACS+ table is guaranteed material: transport (UDP vs TCP 49), encryption scope (password-only vs full payload), and use case (network access vs device admin). Memorize it as three contrasts." }
```

## MFA and modern authentication

Passwords alone fail constantly (phishing, reuse, spraying). **Multi-factor authentication** requires two+ of: something you **know** (password), **have** (token/phone), **are** (biometric). For wired/wireless LAN access, **802.1X** port-based authentication makes the switch port itself demand credentials before granting network access — the AP or switch is the *authenticator*, a RADIUS server the *authentication server*.

```match
{ "prompt": "Match the mechanism to what it secures", "pairs": [ { "left": "enable secret", "right": "Privileged EXEC access on the device" }, { "left": "SSH v2", "right": "Encrypted remote management sessions" }, { "left": "802.1X", "right": "Port-based network admission" }, { "left": "Accounting (AAA)", "right": "Audit trail of admin actions" } ] }
```

```quiz
{ "question": "Security policy requires every admin command on every router to be individually authorized and logged centrally. Which AAA protocol fits best?", "options": ["RADIUS — it combines auth and authorization", "TACACS+ — separated AAA with per-command authorization over TCP", "SNMPv3 — encrypted management", "Local usernames with privilege 15"], "answer": 1, "explanation": "Per-command authorization and full accounting are TACACS+'s signature capabilities (and why it's the standard for device administration). RADIUS bundles authentication+authorization and can't authorize per command." }
```
