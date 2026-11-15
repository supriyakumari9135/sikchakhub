# SikchaKhub.AI — Complete System Design Document (HLD & LLD)

**Platform:** SikchaKhub.AI (AI-Powered Teacher & Faculty Recruitment Engine)  
**Version:** 2.0.0 (Production Release)  
**Author:** Senior Software & Systems Architecture Team  
**Domains:** `sikchakhub.in` (Frontend) | `api.sikchakhub.in` (Backend API)

---

## 1. Executive Summary & Platform Objectives

SikchaKhub.AI is India's dedicated institutional recruitment platform engineered specifically for schools, colleges, and premier coaching institutes (IIT-JEE, NEET, CBSE, ICSE, IB). The platform bridges the gap between verified educators and hiring institutions through:

- **AI-Powered ATS Matching:** Dynamic scoring of teacher qualifications, experience, and subject expertise against vacancy parameters.
- **Tiered Access & Subscription Model:** Free posting with automated screening for the first 5 candidates, and premium subscription access for high-volume hiring.
- **Enterprise Governance Console:** Super Admin and HR consoles enabling multi-stage candidate pipelines, audit trails, and interview orchestration.
- **High-Performance Resilient Architecture:** Hybrid MongoDB Atlas cloud persistence with zero-downtime in-memory fallback store and PM2 multi-core cluster execution.

---

## 2. High-Level Architecture (HLD)

```mermaid
flowchart TD
    subgraph Clients["Client Tier (Web & Mobile Browsers)"]
        TeacherClient["Teacher / Educator Portal"]
        RecruiterClient["Recruiter / School Portal"]
        AdminClient["Super Admin & HR Console"]
    end

    subgraph EdgeTier["Edge & DNS Tier"]
        Cloudflare["Cloudflare / DNS & Edge Cache"]
        VercelCDN["Vercel Global Edge Network (Frontend SPA)"]
    end

    subgraph VPSTier["Contabo VPS Production Tier (api.sikchakhub.in)"]
        Nginx["Nginx Reverse Proxy (SSL, Rate Limiter, Gzip)"]
        subgraph PM2Cluster["Node.js PM2 Cluster Engine (Port 5001)"]
            Worker1["Worker 1 (Express App)"]
            Worker2["Worker 2 (Express App)"]
            WorkerN["Worker N (Express App)"]
        end
        LocalStorage["Local NVMe Storage (/uploads/resumes, /uploads/certificates)"]
    end

    subgraph DataTier["Data & Integration Tier"]
        MongoAtlas[("MongoDB Atlas Cloud Database\n(Replica Set, Pooled)")]
        InMemoryStore[("In-Memory Store Fallback\n(Zero-Downtime Guarantee)")]
        FCM["Firebase Cloud Messaging (Push Notifications)"]
    end

    Clients --> Cloudflare
    Cloudflare --> VercelCDN
    Cloudflare --> Nginx
    Nginx --> PM2Cluster
    Worker1 --> LocalStorage
    Worker2 --> LocalStorage
    WorkerN --> LocalStorage
    Worker1 --> MongoAtlas
    Worker2 --> MongoAtlas
    WorkerN --> MongoAtlas
    Worker1 -.Fallback.-> InMemoryStore
    Worker2 -.Fallback.-> InMemoryStore
    WorkerN -.Fallback.-> InMemoryStore
    Worker1 --> FCM
```

---

## 3. Low-Level Architecture (LLD) & Component Flow

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Educator / Teacher
    participant FE as React Vite SPA (sikchakhub.in)
    participant Nginx as Nginx (api.sikchakhub.in)
    participant AuthMW as Auth & RBAC Middleware
    participant Route as Express Router & Batch Services
    participant DB as MongoDB Atlas (Pooled)
    participant FS as NVMe File System (Async I/O)

    Teacher->>FE: Uploads PDF CV & Submits Application
    FE->>FE: Validates size (< 5MB) & Client State
    FE->>Nginx: POST /api/v1/applications/apply (Bearer Token + JSON/Base64)
    Nginx->>Nginx: Check Rate Limit (100 req/min)
    Nginx->>AuthMW: Proxy to 127.0.0.1:5001
    AuthMW->>AuthMW: Verify JWT & Account Status !== 'SUSPENDED'
    AuthMW->>Route: Pass Authenticated User Context
    Route->>FS: Async Write PDF (Magic Bytes %PDF Validated)
    Route->>DB: Check Duplicate & Insert Application Document
    Route->>DB: Batch Fetch Job & Calculate ATS Score
    DB-->>Route: Persisted Document ID & Match Score
    Route-->>FE: 201 Created (Application Status + ATS Score)
    FE-->>Teacher: Instant Application Confirmation Card
```

---

## 4. Subsystem Specifications

### 4.1 Authentication & Authorization Subsystem
- **JSON Web Tokens (JWT):** Signed using HMAC-SHA256 with 7-day expiration for mobile educator convenience and secure token validation on every request.
- **Account State Verification:** On every authenticated request, user status is checked against MongoDB (`status !== 'SUSPENDED' && status !== 'DEACTIVATED'`) to immediately invalidate revoked sessions without waiting for JWT expiry.
- **Role-Based Access Control (RBAC):** Middleware hierarchy enforcing granular privileges:
  - `TEACHER`: Can manage personal dossier, browse jobs, submit applications, view interview schedules.
  - `EMPLOYER`: Can post vacancies, review candidates up to free/subscribed quota, schedule interviews, view candidate dossiers.
  - `HR`: Can access recruiter pipelines, move candidates across stages, add screening notes, schedule interviews across all institutions.
  - `ADMIN`: Global governance, subscription management, user suspension, fee controls, audit log oversight.

### 4.2 Candidate Application & ATS Scoring Subsystem
- **Automated Resume Parsing:** Extracts subject keywords, degrees, board experience, and years of classroom experience.
- **ATS Scoring Engine:** Computes weighted compatibility index:
  $$\text{ATS Score} = 0.35 \times S_{\text{subject}} + 0.25 \times S_{\text{experience}} + 0.20 \times S_{\text{qualification}} + 0.20 \times S_{\text{curriculum}}$$
- **Tiered Access Enforcement:** Employers on free plans have full candidate dossier access for the first 5 applicants per vacancy; applications $\ge 6$ are redacted at the database query level until subscription activation.

### 4.3 Database Access & Resilience Subsystem
- **Connection Pooling:** Mongoose configured with `maxPoolSize: 50`, `minPoolSize: 10`, `socketTimeoutMS: 45000`.
- **N+1 Elimination:** All administrative and dashboard listings utilize `$in` batch lookups and aggregation pipelines, guaranteeing $O(1)$ database trips regardless of listing length.
- **Fail-Safe Fallback:** In the event of network disruption to MongoDB Atlas, operations gracefully degrade to `dbStore` in-memory structures, maintaining platform availability.

---

## 5. Scalability & Growth Projections

| Horizon | Monthly Active Users | Active Vacancies | Monthly Applications | Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1 (Current)** | 25,000 | 1,000 | 15,000 | Single Contabo VPS (4 vCPU, 8GB RAM), PM2 Cluster (4 workers) |
| **Phase 2 (6 Months)** | 150,000 | 10,000 | 120,000 | Contabo VPS (8 vCPU, 16GB RAM) + Redis Session Cache |
| **Phase 3 (18 Months)** | 1,000,000+ | 75,000 | 1,000,000+ | Horizontal PM2 instances behind Nginx Load Balancer + S3 Cloud Storage |

