# Static Routing

**Routing** is the process of forwarding packets across network segments. A router makes forwarding decisions based on its routing table.

## What is Static Routing?

Static routing is a manual process where a network administrator configures specific routes in a router's routing table.

```
[ Router A ] -------- Configure Static Route --------> [ Network 192.168.2.0/24 ]
```

## Configuring a Static Route

The standard Cisco IOS command to configure a static route is:

```bash
Router(config)# ip route <destination-network> <subnet-mask> <next-hop-ip | exit-interface>
```

### Parameters
*   `destination-network`: The network prefix you want to reach.
*   `subnet-mask`: The subnet mask of the destination network.
*   `next-hop-ip`: The IP address of the adjacent router's interface.
*   `exit-interface`: The interface on the local router used to forward traffic.

## Example Config

To send traffic to `192.168.2.0/24` through next hop `10.0.0.2`:

```bash
Router(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
```

## Pros and Cons

| Feature | Dynamic Routing | Static Routing |
|---|---|---|
| **CPU Overhead** | High (runs algorithms) | None |
| **Bandwidth** | Uses link bandwidth to exchange updates | None |
| **Scalability** | High | Low (manual configurations) |
| **Security** | Susceptible to routing loops/attacks | High |
