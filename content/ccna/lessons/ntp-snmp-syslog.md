Running a network is one-third building, two-thirds *knowing what it's doing*. Three quiet protocols make observability possible: **NTP** keeps every clock honest, **Syslog** records what happened, and **SNMP** lets you ask devices how they feel. Together they're the exam's "IP services" backbone.

## NTP — one truth about time

Logs are worthless if router clocks disagree — correlating an incident across devices with three different times is archaeology. **NTP (UDP 123)** synchronizes clocks against a hierarchy measured in **stratum** levels:

```diagram
{ "type": "layers", "title": "NTP stratum hierarchy", "layers": [ { "label": "Stratum 0", "detail": "Atomic clocks & GPS — the reference itself", "badge": "0" }, { "label": "Stratum 1", "detail": "Servers wired to stratum 0", "badge": "1" }, { "label": "Stratum 2+", "detail": "Each hop from the source adds one — your routers land here", "badge": "2" } ] }
```

```term
R1(config)# ntp server 216.239.35.0
R1(config)# clock timezone IST 5 30
R1# show ntp status
Clock is synchronized, stratum 3, reference is 216.239.35.0
```

Devices can also **serve** time onward (`ntp master`) so your whole estate syncs from two internal sources.

## Syslog — the event stream

Every IOS event you've seen (`%LINK-5-UPDOWN...`) is a **syslog message**. The format encodes a **facility** (what subsystem), a **severity 0–7**, and text. Severity is pure exam gold:

| # | Level | Mnemonic |
|---|---|---|
| 0 | Emergency | **E**very |
| 1 | Alert | **A**wesome |
| 2 | Critical | **C**isco |
| 3 | Error | **E**ngineer |
| 4 | Warning | **W**ill |
| 5 | Notification | **N**eed |
| 6 | Informational | **I**ce cream |
| 7 | Debugging | **D**aily |

Lower number = worse. Configuring `logging trap 4` sends levels **0 through 4** (warnings and worse) to the collector — the threshold *includes everything more severe*.

```term
R1(config)# logging host 10.99.0.20
R1(config)# logging trap warnings
R1(config)# service timestamps log datetime msec
```

```sort
{ "prompt": "Order syslog severities from MOST severe to least", "items": ["0 Emergency", "2 Critical", "4 Warning", "6 Informational", "7 Debugging"] }
```

## SNMP — ask and be told

**SNMP (UDP 161)** lets a monitoring station (**NMS**) query devices (**agents**) for structured data in the **MIB** (Management Information Base) — interface counters, CPU, temperature — and lets agents push **traps** (unsolicited alerts, UDP 162) when things happen.

Versions matter:

- **v2c** — community strings ("passwords" in cleartext). Still everywhere; treat as insecure.
- **v3** — real **authentication and encryption**. The only version you should deploy new.

```term
R1(config)# snmp-server community MONITOR ro
R1(config)# snmp-server host 10.99.0.21 traps version 2c MONITOR
```

```match
{ "prompt": "Match the protocol to its role (and port)", "pairs": [ { "left": "NTP", "right": "Clock sync — UDP 123" }, { "left": "Syslog", "right": "Event messages — UDP 514" }, { "left": "SNMP polling", "right": "NMS queries agents — UDP 161" }, { "left": "SNMP traps", "right": "Agent-initiated alerts — UDP 162" } ] }
```

```callout
{ "type": "exam", "body": "Three memorizables: syslog severity names/numbers (use the mnemonic), SNMPv3 = the secure version, NTP stratum = distance from the reference clock. 'logging trap 3' sends severities 0–3 — the counting-down inclusion trips many candidates." }
```

```quiz
{ "question": "You configure 'logging trap notifications' (level 5). A level-6 informational event occurs. Is it sent to the syslog server?", "options": ["Yes — 6 is above the threshold", "No — only severities 0–5 are sent; 6 is LESS severe", "Yes — informational events are always sent", "No — level 5 sends ONLY level-5 messages"], "answer": 1, "explanation": "The trap level is a severity ceiling counting toward zero: 'notifications' forwards levels 0 through 5. Level 6 (informational) is less severe than the threshold and is filtered out." }
```
