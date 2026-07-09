# TCP/IP Protocol Suite

The **TCP/IP model** (or Internet Protocol Suite) is a simplified version of the OSI model. It is the practical framework upon which the internet and most modern networks are built.

## TCP/IP vs. OSI Model Comparison

While the OSI model is excellent for learning and troubleshooting, the TCP/IP model corresponds directly to active internet protocols.

| OSI Layer | TCP/IP Layer | Associated Protocols |
|---|---|---|
| 7. Application | | |
| 6. Presentation | **Application** | HTTP, DNS, DHCP, FTP, SSH |
| 5. Session | | |
| 4. Transport | **Transport** | TCP, UDP |
| 3. Network | **Internet** | IPv4, IPv6, ICMP, ARP |
| 2. Data Link | **Network Access** | Ethernet, Wi-Fi (802.11), PPP |
| 1. Physical | | |

## Key Differences

1. **Simplicity**: The TCP/IP model has only 4 layers, merging OSI's Application, Presentation, and Session layers into a single Application layer, and physical/data link into a Network Access layer.
2. **Implementation**: TCP/IP was developed before the OSI model, making it the factual standard of the Internet.
3. **PDU Mapping**:
   *   Application layer: **Data**
   *   Transport layer: **Segments** (TCP) or **Datagrams** (UDP)
   *   Internet layer: **Packets**
   *   Network Access layer: **Frames** & **Bits**
