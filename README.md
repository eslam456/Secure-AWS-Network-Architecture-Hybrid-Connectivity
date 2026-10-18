# Secure-AWS-Network-Architecture-Hybrid-Connectivity
Secure AWS Network Architecture &amp; Hybrid Connectivity(website)
# AWS Hybrid Cloud Architecture with WireGuard VPN & Traffic Mirroring

## Overview
This repository contains the architecture documentation for a highly available, secure, and monitored AWS environment. The architecture features a public-facing web application, a private database tier, and secure hybrid connectivity to an on-premises network using WireGuard VPN and VPC Peering. 

It also includes comprehensive security and logging mechanisms utilizing AWS native services like CloudWatch, VPC Flow Logs, Athena, and AWS WAF.

## Architecture Diagram

![AWS Hybrid Cloud Architecture Diagram](./Untitled%20Diagram.jpg)
---

## Core Components

### 1. Edge & Frontend (Internet / Users)
*   **Amazon CloudFront**: Acts as the Content Delivery Network (CDN) and entry point for internet users, providing low latency and DDoS protection.
*   **S3 Frontend**: Hosts static web assets (HTML, CSS, JS, images) served directly via CloudFront.
*   **AWS WAF (Web Application Firewall)**: Filters and monitors HTTP(S) requests to protect the application from common web exploits (SQL injection, XSS, etc.).

### 2. Main VPC (`10.0.0.0/16`)
The core AWS environment is divided into public and private subnets across multiple Availability Zones (AZ-a and AZ-b) for high availability.

*   **Application Load Balancer (ALB)**: Distributes incoming application traffic from CloudFront across multiple targets (EC2 instances) in the public subnets.
*   **Public Subnet 1 (AZ-a)**: 
    *   Hosts an EC2 Instance (Web/App Server).
*   **Public Subnet 2 (AZ-b)**:
    *   Hosts an EC2 Instance (Web/App Server).
    *   **EC2 (Traffic Mirror)**: Receives mirrored network traffic for deep packet inspection, analysis, or security monitoring.
    *   **EC2 (SSM Managed & WireGuard Server)**: Acts as the VPN endpoint for hybrid connectivity and is managed securely via AWS Systems Manager (SSM).
*   **Private Subnet 1 (AZ-a)**:
    *   Hosts an isolated EC2 Instance (likely for internal processing or backend tasks).
*   **Private Subnet 2 (AZ-b)**:
    *   **Amazon RDS (MySQL)**: The relational database tier. It is isolated from the internet and only accessible from the application tier via **Port 3306**.
*   **NAT Gateway**: Allows instances in the VPC (specifically those needing updates or external API access) to initiate outbound traffic to the internet while remaining private.
*   **S3 Gateway Endpoint**: Allows secure, private routing from the VPC to Amazon S3 without traversing the public internet.

### 3. Hybrid Connectivity & On-Premises (`192.168.0.0/16`)
*   **VPC Peering**: Establishes a direct network connection between the Main AWS VPC and the on-premises network.
*   **WireGuard VPN**: Provides secure, encrypted tunneling. 
    *   Uses **UDP Port 51820**.
    *   The WireGuard server sits in the Main VPC, while a WireGuard Client EC2 instance sits in the on-premises environment (or a simulated on-premises VPC).

### 4. Monitoring, Logging & Security
*   **CloudWatch Alarms & Dashboards**: Monitors the health, performance, and metrics of all AWS resources.
*   **VPC Flow Logs**: Captures IP traffic going to and from network interfaces in the VPC.
*   **Amazon Athena**: Enables interactive query analysis of the VPC Flow Logs stored in S3 for security auditing and troubleshooting.

---

## Key Traffic Flows

1.  **User Access**: Internet Users → CloudFront (WAF protected) → S3 (Static) OR Application Load Balancer → EC2 Instances in Public Subnets.
2.  **Database Queries**: EC2 Instances → RDS MySQL over **Port 3306** (restricted to private subnets).
3.  **Hybrid Access**: On-Premises Network (`192.168.0.0/16`) ↔ VPC Peering ↔ WireGuard VPN (**UDP 51820**) ↔ Main VPC (`10.0.0.0/16`).
4.  **Monitoring**: Traffic is mirrored to the Traffic Mirror EC2 instance. VPC Flow Logs are sent to CloudWatch and can be queried via Athena.

## Security Highlights
*   **Network Isolation**: Databases and backend instances reside in Private Subnets with no direct internet access.
*   **Encrypted Tunnels**: WireGuard provides modern, high-performance encryption for hybrid traffic.
*   **Managed Access**: EC2 instances utilize AWS Systems Manager (SSM) for secure remote management, reducing the need to open SSH/RDP ports.
*   **Traffic Analysis**: Dedicated traffic mirroring allows security teams to analyze packet-level data without disrupting production workloads.
