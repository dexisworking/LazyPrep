"The cloud" is someone else's data center with an API. That flippant definition hides a serious shift: infrastructure became rentable by the minute, and enterprise WANs had to be redesigned to reach it. This lesson covers both halves — cloud models and the WAN architectures connecting you to everything.

## Cloud service models — how much do you manage?

```diagram
{ "type": "layers", "title": "Service models — what YOU manage shrinks downward", "layers": [ { "label": "IaaS", "detail": "Rent VMs/networks/storage — you manage OS and up (AWS EC2)", "badge": "1" }, { "label": "PaaS", "detail": "Rent a platform — you bring only code (Heroku, App Engine)", "badge": "2" }, { "label": "SaaS", "detail": "Rent finished software — you just use it (M365, Salesforce)", "badge": "3" } ] }
```

## Cloud deployment models

- **Public** — provider's shared infrastructure (AWS, Azure, GCP). Pay-as-you-go elasticity.
- **Private** — cloud-style automation on infrastructure you own. Control and compliance, at capex prices.
- **Hybrid** — private + public working together (burst to public at peak; keep regulated data home).
- **Community** — shared by organizations with a common cause (rare; know the word).

```match
{ "prompt": "Match the scenario to the cloud model", "pairs": [ { "left": "Rent Ubuntu VMs and build everything yourself", "right": "IaaS" }, { "left": "Deploy code; provider runs the platform", "right": "PaaS" }, { "left": "Open the CRM in a browser", "right": "SaaS" }, { "left": "Sensitive data on-prem, web tier bursts to AWS", "right": "Hybrid cloud" } ] }
```

## WAN architectures — reaching sites and clouds

Connecting branches to HQ (and everyone to cloud) offers a menu:

- **Leased line** — dedicated point-to-point circuit. Predictable, private, expensive, slow to provision.
- **MPLS VPN** — provider-run shared backbone with private label-switched paths. The 2000s enterprise standard; QoS guarantees, but costly per megabit.
- **Internet VPN** — IPsec tunnels over ordinary broadband. Cheap bandwidth, zero guarantees.
- **Metro Ethernet** — Ethernet handoffs across a provider's metro network; your WAN feels like one big LAN.

## SD-WAN — the modern answer

**SD-WAN** puts software in charge of multiple transports at once (MPLS + broadband + LTE):

```diagram
{ "type": "flow", "title": "SD-WAN in action", "steps": [ { "label": "Measure", "detail": "Edge devices probe loss/latency/jitter on every path continuously" }, { "label": "Decide", "detail": "Central policy: 'voice needs <150 ms — use whichever path delivers'" }, { "label": "Steer", "detail": "Per-application routing; failover in milliseconds" } ] }
```

Result: expensive MPLS shrinks to what truly needs guarantees, cheap broadband carries the bulk, and cloud traffic exits locally instead of hairpinning through HQ. Centralized dashboards replace box-by-box CLI — a preview of the SDN lesson next.

```callout
{ "type": "exam", "body": "Definitions to lock in: IaaS/PaaS/SaaS by 'who manages what', public/private/hybrid by 'whose infrastructure', and SD-WAN = application-aware routing over multiple transports with centralized policy. Scenario→term matching is the question format." }
```

```quiz
{ "question": "A retailer with 300 stores pays heavily for MPLS everywhere. They want cheap broadband at stores, automatic failover, and voice always taking the best-performing path. What are they describing?", "options": ["More MPLS", "SD-WAN", "A bigger leased line", "Peer-to-peer VPN mesh, manually configured"], "answer": 1, "explanation": "Application-aware path selection across mixed transports, central policy, automatic failover — that's SD-WAN's exact pitch, and 'reduce MPLS spend using broadband' is its classic business case." }
```
