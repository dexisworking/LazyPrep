# VLAN Fundamentals

A **Virtual Local Area Network (VLAN)** is a logical subnetwork that groups together a collection of devices from different physical LANs.

## Why Use VLANs?

By default, all ports on a switch belong to the same broadcast domain. If one device sends a broadcast frame, all other devices receive it.
VLANs segment a single physical switch into multiple logical switches, dividing broadcast domains.

```
       +-----------------------------------+
       |           Switch (Physical)       |
       +-----------------+-----------------+
       |     VLAN 10     |     VLAN 20     |
       |  (Sales Dept)   |  (Finance Dept) |
       +-----------------+-----------------+
```

### Benefits of VLANs
1. **Security**: Sensitive data can be kept isolated.
2. **Cost Reduction**: Save on buying separate physical switches.
3. **Performance**: Reduces broadcast traffic across the network.
4. **Flexibility**: Devices can be grouped by department rather than physical location.

## Access vs. Trunk Ports

To pass VLAN traffic, switchports must be configured as either access or trunk:

*   **Access Port**: Belongs to a single VLAN. Used to connect end devices (PCs, printers).
*   **Trunk Port**: Can carry traffic for multiple VLANs simultaneously. Used to connect switch-to-switch or switch-to-router.

### 802.1Q Tagging
When a frame leaves a trunk port, the switch inserts a 4-byte header (VLAN Tag) defined by the IEEE **802.1Q** standard. This tag specifies which VLAN the frame belongs to so the receiving switch can route it to the correct port.
