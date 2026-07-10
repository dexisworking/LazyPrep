The server room of 2005 held a hundred machines running at 10% utilization. Today one physical box hosts dozens of servers — and networks themselves are increasingly software. **Virtualization** is the foundation of cloud, data centers, and modern network design.

## Virtual machines and hypervisors

A **virtual machine (VM)** is a complete computer — OS, disks, network cards — existing as software. The **hypervisor** is the layer that carves physical hardware into VMs and keeps them isolated:

```diagram
{ "type": "compare", "title": "Hypervisor types", "left": { "title": "Type 1 — bare metal", "items": ["Runs directly ON the hardware", "ESXi, Hyper-V, KVM, Proxmox", "Data-center standard", "Minimal overhead, maximal isolation"] }, "right": { "title": "Type 2 — hosted", "items": ["Runs as an app on a normal OS", "VirtualBox, VMware Workstation", "Labs and desktops (your CCNA lab!)", "Convenient, less efficient"] } }
```

Why it won: **consolidation** (one box, many servers), **isolation** (one crash doesn't sink the rest), **agility** (new server in minutes; snapshot before risky changes; migrate VMs between hosts live).

## Containers — lighter, faster, denser

**Containers** (Docker, Kubernetes-orchestrated) virtualize at the OS level: every container shares the host's kernel but gets isolated processes, filesystems, and networking. No guest OS per instance means megabytes instead of gigabytes and **millisecond startup**.

```diagram
{ "type": "compare", "title": "VMs vs Containers", "left": { "title": "Virtual machines", "items": ["Each carries a FULL guest OS", "Gigabytes; boots in minutes", "Strongest isolation", "Run anything, any OS"] }, "right": { "title": "Containers", "items": ["Share the host kernel", "Megabytes; start in milliseconds", "Process-level isolation", "Perfect for microservices & CI/CD"] } }
```

```callout
{ "type": "exam", "body": "The distinctions tested: Type 1 vs Type 2 hypervisors (on hardware vs on an OS), and VMs vs containers (guest OS per VM vs shared kernel). 'Which is more resource-efficient for running 50 copies of one app?' → containers." }
```

## Virtual networking

VMs need networks too — so the network moved into the hypervisor:

- **vNIC** — a VM's virtual network card.
- **vSwitch** — a software switch inside the host connecting vNICs to each other and to physical NICs. VLANs, trunks — same concepts, now in software.
- Two VMs on one host can talk **without a packet ever touching a physical wire** — remember that when a "network" capture shows nothing.

**VRF (Virtual Routing and Forwarding)** applies the same trick to routers: one physical router holding multiple *independent routing tables* — customer A and customer B can even use overlapping IP ranges, cleanly separated. It's "VLANs for Layer 3."

```match
{ "prompt": "Match the virtualization concept to its description", "pairs": [ { "left": "Type 1 hypervisor", "right": "Runs directly on server hardware" }, { "left": "Container", "right": "Shares the host kernel — lightweight" }, { "left": "vSwitch", "right": "Software switch inside a hypervisor" }, { "left": "VRF", "right": "Multiple routing tables on one router" } ] }
```

```quiz
{ "question": "Two VMs on the same ESXi host and VLAN exchange traffic. A packet capture on the physical switch port shows none of it. Why?", "options": ["The capture is misconfigured", "VM traffic is always encrypted", "The vSwitch forwards VM-to-VM traffic internally — it never reaches the physical network", "VMs can't be captured"], "answer": 2, "explanation": "Same host + same VLAN means the hypervisor's vSwitch switches the frames in software. Only traffic destined for OTHER hosts exits via the physical uplink. Visibility inside the host requires capturing at the vSwitch level." }
```
