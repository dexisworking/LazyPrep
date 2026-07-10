A **topology** is the shape of a network — how its devices interconnect. There are two views of that shape: the **physical topology** (where cables actually run) and the **logical topology** (how data actually flows). They don't have to match, and on modern networks they often don't.

## Star — the modern default

All devices connect to a central device (a switch). This is how virtually every modern LAN is built.

- **Pros:** one cable cut affects one device; easy to add hosts; easy to troubleshoot.
- **Cons:** the central switch is a single point of failure — which is why enterprises add redundancy (next section).

## Mesh — maximum redundancy

Every device links to every other (**full mesh**) or to several others (**partial mesh**).

- **Pros:** survives multiple failures; no single point of failure.
- **Cons:** cost explodes — a full mesh of *n* devices needs **n(n−1)/2** links. Ten routers? 45 links.

Full mesh is common between core routers or data centers; nobody full-meshes desktop PCs.

## Bus and Ring — the ancestors

- **Bus:** all devices tap one shared cable. One break kills the whole segment. Obsolete (early Ethernet).
- **Ring:** devices form a loop; data circulates around it. Legacy (Token Ring, FDDI), though *logical* rings survive in some provider networks.

You study these because exam questions still reference them — and because their failure modes explain *why* star won.

```match
{ "prompt": "Match the topology to its defining trait", "pairs": [ { "left": "Star", "right": "All hosts connect to one central switch" }, { "left": "Full mesh", "right": "Every node links to every other node" }, { "left": "Bus", "right": "One shared cable; a single break kills all" }, { "left": "Ring", "right": "Closed loop; data circulates node to node" } ] }
```

## Hybrid reality: the extended star

Real networks layer topologies. A campus typically uses an **extended star** (star of stars): access switches star out to desks, and those switches star up to distribution switches, with **partial mesh** between distribution and core for redundancy.

```diagram
{ "type": "flow", "title": "Extended star in a campus", "direction": "vertical", "steps": [ { "label": "Core / Distribution switches", "detail": "Meshed together for redundancy" }, { "label": "Access switches", "detail": "Star up to distribution" }, { "label": "End devices", "detail": "Star out from each access switch" } ] }
```

## Physical vs logical

Classic example: old Ethernet hubs were wired as a *physical star* but behaved as a *logical bus* — every device heard every transmission. Modern switched Ethernet is star in both senses. Keep the distinction in your pocket; it reappears with Wi-Fi (physical star around the AP, logically a shared medium).

```callout
{ "type": "exam", "body": "Given a scenario ('a break in one cable disconnects only one workstation'), identify the topology. Star = one device lost per cable; bus = everyone lost; full mesh = nothing lost. The full-mesh link formula n(n−1)/2 is also fair game." }
```

```quiz
{ "question": "You need to fully mesh 6 branch routers. How many point-to-point links is that?", "options": ["6", "12", "15", "30"], "answer": 2, "explanation": "n(n−1)/2 = 6×5/2 = 15 links. This quadratic growth is exactly why full mesh is reserved for small cores, not entire networks." }
```
