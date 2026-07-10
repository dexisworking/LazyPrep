Routers know their **connected** networks automatically — everything else must be taught. The simplest teaching method is a **static route**: you, the admin, telling the router exactly where to send traffic. Static routes run half the Internet's edges and every CCNA lab.

## The command

```term
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
```

Read: "to reach network `192.168.2.0/24`, forward to next hop `10.0.0.2`."

Three ways to specify the path:

- **Next-hop IP** — `ip route 192.168.2.0 255.255.255.0 10.0.0.2` (most common).
- **Exit interface** — `ip route 192.168.2.0 255.255.255.0 gi0/1` (fine on point-to-point links only).
- **Fully specified** — both: `... gi0/1 10.0.0.2` (safest on multi-access links like Ethernet).

## The default route

The most important static route of all — the catch-all for "everything else," pointing at your ISP:

```term
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

`0.0.0.0/0` matches every destination (zero required matching bits) but *loses* every longest-prefix contest — so it's used exactly when nothing better exists. Perfect for edge routers: one route instead of the whole Internet's table.

```callout
{ "type": "exam", "body": "'A branch router needs to reach all remote networks through one WAN link with minimal configuration' → default static route. Also know the IPv6 twins: 'ipv6 route ::/0 <next-hop>' and 'ipv6 route 2001:db8:2::/64 <next-hop>'." }
```

## Both directions, always

Rookie mistake: configuring R1 → R2 and forgetting the **return route**. Ping fails not because the packet didn't arrive — because the *reply* had no route home. Every path needs routes in **both directions**.

```diagram
{ "type": "flow", "title": "Why one-way routes break ping", "steps": [ { "label": "R1 → R2", "detail": "Static route exists — echo request arrives ✓" }, { "label": "R2 → R1?", "detail": "No return route — echo reply dropped ✗" }, { "label": "Fix", "detail": "Add the mirror route on R2" } ] }
```

## Floating static routes — cheap backup

A static route normally has AD 1 — it beats OSPF (110). Give it a *worse* AD and it hides until the primary dies:

```term
R1(config)# ip route 172.16.0.0 255.255.0.0 10.0.0.2        ! primary (AD 1)
R1(config)# ip route 172.16.0.0 255.255.0.0 10.0.99.2 150   ! floating backup (AD 150)
```

While the AD-1 route is valid, the AD-150 one stays out of the table. Primary link fails → the "floating" route surfaces → traffic shifts to backup. This trick also backs up dynamic protocols (use AD > the protocol's).

```match
{ "prompt": "Match the static route flavor to its use", "pairs": [ { "left": "0.0.0.0/0 route", "right": "Catch-all toward the ISP" }, { "left": "Floating static (AD 150)", "right": "Backup that appears when primary fails" }, { "left": "Fully specified route", "right": "Interface + next-hop on multi-access links" }, { "left": "Host route /32", "right": "Pin a path to one exact device" } ] }
```

## Static vs dynamic — when each wins

| | Static | Dynamic (OSPF etc.) |
|---|---|---|
| Effort | Manual per route | Auto-discovers & adapts |
| Failure response | None — stays wrong | Reroutes automatically |
| Overhead | Zero | CPU + bandwidth |
| Scale | Small topologies, edges, stubs | Everything else |

Real networks mix both: dynamic in the core, static defaults and stubs at the edges.

```quiz
{ "question": "You add 'ip route 10.5.0.0 255.255.0.0 192.0.2.9 200' while OSPF already provides 10.5.0.0/16. What happens?", "options": ["The static route replaces OSPF immediately — static always wins", "Nothing visible now; the static route activates only if the OSPF route disappears", "Both install and load-balance", "The command is rejected — AD can't exceed 120"], "answer": 1, "explanation": "AD 200 is worse than OSPF's 110, so the static route floats in reserve. When OSPF withdraws the prefix (link failure), the floating static installs — a designed backup path." }
```
