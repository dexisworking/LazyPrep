# Network Topologies

A **network topology** is the structural layout of a network. It can be viewed in two ways: physical topology (how the cables and devices are physically laid out) and logical topology (how data flows through the network).

## Physical Topologies

Here are the primary physical topologies used in networking:

### 1. Star Topology
All end devices are connected to a central intermediary device (typically a Switch).
*   **Pros**: Easy to install, single device failure doesn't affect the rest, easy to troubleshoot.
*   **Cons**: Central device is a single point of failure.

```
       [ PC 1 ]
          ||
[ PC 4 ]==[ Switch ]==[ PC 2 ]
          ||
       [ PC 3 ]
```

### 2. Mesh Topology
Every device is connected to every other device (Full Mesh) or some devices are connected to multiple others (Partial Mesh).
*   **Pros**: Highly redundant, no single point of failure.
*   **Cons**: Expensive, complex cabling and interface requirements.

### 3. Bus Topology
Devices are connected to a single central cable (the "bus" or "backbone").
*   **Pros**: Cheap, easy to set up for small networks.
*   **Cons**: A break in the backbone cable brings down the entire network.

### 4. Ring Topology
Devices are connected in a closed loop, where data travels in one direction.

## Summary of Topology Characteristics

| Topology | Cost | Redundancy | Cable Length Required |
|---|---|---|---|
| **Star** | Medium | Low | High |
| **Full Mesh** | Very High | Extremely High | Very High |
| **Bus** | Low | None | Low |
| **Ring** | Medium | Low | Medium |
