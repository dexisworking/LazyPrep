# The OSI Model Layer by Layer

The **Open Systems Interconnection (OSI) model** is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven abstract layers.

## The Seven Layers

Data moves down the stack on the sending device (encapsulation) and up the stack on the receiving device (de-encapsulation).

```
+------------------------------------+
| 7. Application  (HTTP, FTP, DNS)   |
+------------------------------------+
| 6. Presentation (SSL, ASCII, JPEG) |
+------------------------------------+
| 5. Session      (RPC, NetBIOS)     |
+------------------------------------+
| 4. Transport    (TCP, UDP)         |
+------------------------------------+
| 3. Network      (IP, ICMP, OSPF)   |
+------------------------------------+
| 2. Data Link    (Ethernet, MAC)    |
+------------------------------------+
| 1. Physical     (Cables, Bits)     |
+------------------------------------+
```

## Detailed Layer Functions

### Layer 7: Application
Provides network services directly to user applications.
*   **Protocols**: HTTP, HTTPS, FTP, DNS, DHCP, SMTP.

### Layer 6: Presentation
Responsible for data formatting, translation, compression, and encryption.
*   **Examples**: JPEG, ASCII, SSL/TLS.

### Layer 5: Session
Establishes, manages, and terminates connections (sessions) between applications.

### Layer 4: Transport
Handles end-to-end communication, flow control, error detection, and segmentation.
*   **Protocols**: TCP (transmission control protocol) and UDP (user datagram protocol).
*   **PDU (Protocol Data Unit)**: **Segment**.

### Layer 3: Network
Responsible for logical addressing (IP addresses) and path determination (routing).
*   **Protocols**: IPv4, IPv6, ICMP, ARP.
*   **PDU**: **Packet**.

### Layer 2: Data Link
Responsible for physical addressing (MAC addresses) and media access control.
*   **Protocols**: Ethernet, PPP, HDLC.
*   **PDU**: **Frame**.

### Layer 1: Physical
Transmits raw bit streams over physical media.
*   **Examples**: Ethernet cables, fiber optics, radio waves.
*   **PDU**: **Bit**.
