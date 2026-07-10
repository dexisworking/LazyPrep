Every time you send a message, stream a video, or load this very lesson, you're using a **computer network**. Before we touch a single cable or command, let's build the mental model that everything else in this course hangs on.

## What exactly is a network?

A **network** is two or more devices connected together so they can **share data and resources**. That's it. Two laptops joined by a cable form a network. So do the billions of devices that make up the Internet — same idea, scaled up.

The devices on a network fall into a few roles:

- **Clients** — devices that *request* something: your laptop asking for a web page, your phone fetching email.
- **Servers** — devices that *provide* something: a web server sending pages, a file server storing documents.
- **Networking devices** — the machinery in between (switches, routers, access points) that moves the data.

```callout
{ "type": "info", "body": "A single machine can play both roles. When your laptop shares files with a colleague it's acting as a server; when it loads a website it's a client. Client and server describe behavior, not hardware." }
```

## Two ways to organize a network

**Client–server networks** centralize resources. Dedicated servers hold the data and services; clients connect to them. This is how businesses (and the Internet) work: it's easier to secure, back up, and scale.

**Peer-to-peer (P2P) networks** let every device share directly with every other — no dedicated server. Cheap and simple for a handful of home PCs, but messy at scale: no central security, no central backups.

```diagram
{ "type": "compare", "title": "Client–Server vs Peer-to-Peer", "left": { "title": "Client–Server", "items": ["Central servers hold data & services", "Easier security, backup, management", "Scales to thousands of users", "Costs more (dedicated hardware, admins)"] }, "right": { "title": "Peer-to-Peer", "items": ["Every device shares directly", "Cheap — no dedicated server needed", "Fine for a few devices at home", "No central control; hard to secure at scale"] } }
```

## The three ingredients of every network

1. **End devices (hosts)** — the sources and destinations of data: PCs, servers, phones, printers, IP cameras.
2. **Intermediary devices** — switches, routers, firewalls, and access points that connect hosts and steer traffic.
3. **Media** — the pathways data travels: copper cable, fiber optic glass, or radio waves.

```match
{ "prompt": "Match each component to its role", "pairs": [ { "left": "End device", "right": "Source or destination of data" }, { "left": "Intermediary device", "right": "Connects hosts and steers traffic" }, { "left": "Media", "right": "The physical pathway signals travel" } ] }
```

## What networks carry

Everything a network moves is ultimately **data**, but different traffic has different needs:

- **File and print sharing** — cares about *completeness*; a corrupted file is useless.
- **Web and applications** — bursty request/response traffic.
- **Voice and video** — real-time streams that hate *delay* more than occasional loss.
- **Storage and backups** — bulk transfers that want raw *throughput*.

Much of network engineering is balancing those competing needs on shared infrastructure — a theme you'll see again in the QoS lesson much later.

## The journey ahead

Keep this picture in your head; the whole course is a zoom-in on each piece of it:

```diagram
{ "type": "flow", "title": "A request crossing a simple network", "steps": [ { "label": "Client", "detail": "Your laptop asks for a page" }, { "label": "Switch", "detail": "Forwards the frame inside the LAN" }, { "label": "Router", "detail": "Chooses a path toward the destination network" }, { "label": "Server", "detail": "Answers with the data" } ] }
```

```quiz
{ "question": "Your laptop downloads a webpage from www.example.com. Which statement is accurate?", "options": ["Your laptop is the server; example.com's machine is the client", "Your laptop is the client; example.com's machine is the server", "Both devices are clients", "Only routers can be servers"], "answer": 1, "explanation": "The device requesting the resource (your laptop) is the client; the device providing it (the web server) is the server. The roles describe who asks and who answers." }
```

Next up: a guided tour of the devices in the middle.
