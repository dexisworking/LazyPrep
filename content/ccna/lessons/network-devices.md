A network is only as smart as the boxes that run it. This lesson is your guided tour of every device you'll configure, secure, and troubleshoot in this course — what each one does, and crucially, **where its intelligence lives**.

## Switches — the LAN's connective tissue

A **switch** connects end devices *within* a network. Plug in PCs, printers, servers, and access points, and the switch forwards traffic between them.

- Operates primarily at **Layer 2** (Data Link) using **MAC addresses**.
- Has many ports (24 and 48 are common) because it's the device hosts physically plug into.
- **Does not** provide connectivity *between* networks — that's the router's job.
- Modern **Layer 3 switches** can also route, blurring the line (more on that in Inter-VLAN Routing).

## Routers — between networks

A **router** connects *different* networks together and picks paths between them.

- Operates at **Layer 3** (Network) using **IP addresses**.
- Maintains a **routing table**: a map of destination networks and how to reach them.
- Your home "Wi-Fi box" is actually a router + switch + access point + firewall in one plastic shell. Enterprise gear separates these roles.

```diagram
{ "type": "compare", "title": "Switch vs Router", "left": { "title": "Switch", "items": ["Connects devices WITHIN a network", "Forwards frames using MAC addresses (L2)", "Many ports (24–48)", "Creates one big high-speed LAN"] }, "right": { "title": "Router", "items": ["Connects networks TO EACH OTHER", "Forwards packets using IP addresses (L3)", "Fewer, faster interfaces", "Chooses best path across networks"] } }
```

## Firewalls — the gatekeepers

A **firewall** monitors and controls traffic based on security rules: *"allow web traffic in to this server, drop everything else."*

- Traditional firewalls filter on addresses and ports.
- **Next-generation firewalls (NGFW)** add application awareness, intrusion prevention (IPS), and encrypted-traffic inspection.
- Can be dedicated hardware, software on a host, or a feature on a router.

## Access Points — Wi-Fi on-ramps

An **access point (AP)** bridges wireless devices onto the wired LAN. The AP is *not* the network — it's a doorway into it. Enterprise APs are often centrally managed by a **Wireless LAN Controller (WLC)**, which you'll meet in the wireless module.

## Endpoints and servers

Everything above exists to serve **endpoints**: PCs, phones, cameras, sensors, and the **servers** they talk to. In diagrams, endpoints are the leaves of the tree; the switches, routers, and firewalls form the trunk and branches.

```flip
{ "title": "Device cheat cards — tap to reveal", "cards": [ { "front": "Forwards frames within a LAN using MAC addresses", "back": "Switch (Layer 2)" }, { "front": "Routes packets between networks using IP addresses", "back": "Router (Layer 3)" }, { "front": "Permits or denies traffic based on security rules", "back": "Firewall" }, { "front": "Connects Wi-Fi devices to the wired LAN", "back": "Access Point" } ] }
```

## Seeing a device for real

On Cisco gear you'll spend your life in the **IOS command line**. Here's a first taste — asking a switch what's connected:

```term
Switch# show ip interface brief
Interface      IP-Address      OK? Method Status                Protocol
Vlan1          192.168.1.2     YES manual up                    up
Gi0/1          unassigned      YES unset  up                    up
Gi0/2          unassigned      YES unset  administratively down down
```

Don't worry about the details yet — by mid-course you'll read this output like a sentence.

```callout
{ "type": "exam", "body": "The exam loves role questions: 'which device connects networks?' (router), 'which device filters traffic by security policy?' (firewall), 'which device extends the LAN wirelessly?' (AP). Know each device's one-line job description cold." }
```

```quiz
{ "question": "A company needs to connect its office LAN to the Internet AND filter incoming traffic by security policy. Which pair of devices most directly provides these two functions?", "options": ["Switch + Access Point", "Router + Firewall", "Switch + Router", "Access Point + Firewall"], "answer": 1, "explanation": "The router connects the LAN to another network (the Internet); the firewall enforces security policy on the traffic crossing that boundary. Switches and APs work within the LAN." }
```
