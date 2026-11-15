# SikchaKhub.AI — REST API Documentation (v1)

**Production Base URL:** `https://api.sikchakhub.in`  
**Development Base URL:** `http://localhost:5001`  
**Current API Prefix:** `/api/v1`

---

## 1. Authentication & Common Headers

All authenticated endpoints require an Authorization header with a valid JSON Web Token:

```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable description of error.",
  "errors": ["Optional list of validation errors"]
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 Register New Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Access:** Public
- **Rate Limit:** 30 requests / 5 minutes
- **Request Body (Teacher Example):**
```json
{
  "fullName": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "password": "SecurePassword123!",
  "phone": "+91 9876543210",
  "role": "TEACHER",
  "subject": "Physics",
  "experienceYears": 5,
  "highestQualification": "M.Sc Physics + B.Ed",
  "currentCity": "Kota",
  "resumeBase64": "data:application/pdf;base64,JVBERi0xLjQK...",
  "resumeFileName": "Priya_Sharma_Resume.pdf"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Welcome to SikchaKhub!",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-1731234567890",
    "email": "priya.sharma@example.com",
    "fullName": "Priya Sharma",
    "role": "TEACHER"
  }
}
```

### 2.2 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Rate Limit:** 30 requests / 5 minutes
- **Request Body:**
```json
{
  "email": "priya.sharma@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-1731234567890",
    "email": "priya.sharma@example.com",
    "fullName": "Priya Sharma",
    "role": "TEACHER",
    "avatarUrl": "/avatar.png"
  }
}
```

### 2.3 Upload PDF Resume
- **Endpoint:** `POST /api/v1/auth/upload-resume`
- **Access:** Authenticated (`TEACHER`, `ADMIN`)
- **Constraints:** PDF only, magic signature `%PDF`, size $\le 5\text{MB}$
- **Request Body:**
```json
{
  "base64Data": "data:application/pdf;base64,JVBERi0xLjQK...",
  "fileName": "Updated_CV_2026.pdf"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "CV uploaded and profile updated successfully.",
  "resumeUrl": "/uploads/resumes/cv-usr-1731234567890-1731234567-Updated_CV_2026.pdf",
  "resumeFileName": "Updated_CV_2026.pdf"
}
```

---

## 3. Job Vacancies Endpoints (`/api/v1/jobs`)

### 3.1 Search & Filter Vacancies
- **Endpoint:** `GET /api/v1/jobs`
- **Access:** Public
- **Query Parameters:**
  - `search` (string): Keyword matching title, institution, or description
  - `subject` (string): e.g., `Physics`, `Mathematics`, `English`
  - `location` / `city` (string): e.g., `Kota`, `Delhi`, `Jaipur`
  - `teachingLevel` (string): `PGT`, `TGT`, `PRT`, `COACHING_JEE`, `COACHING_NEET`
  - `board` (string): `CBSE`, `ICSE`, `IB`, `CAMBRIDGE`
  - `page` (number, default: 1), `limit` (number, default: 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "total": 124,
  "page": 1,
  "limit": 20,
  "jobs": [
    {
      "id": "job-101",
      "title": "PGT Physics Faculty",
      "subject": "Physics",
      "teachingLevel": "PGT",
      "salaryRange": { "min": 600000, "max": 1000000, "currency": "INR" },
      "institution": {
        "id": "inst-1",
        "name": "Delhi Public Academy",
        "city": "New Delhi",
        "state": "Delhi",
        "isVerified": true
      },
      "totalApplications": 18
    }
  ]
}
```

### 3.2 Post New Vacancy
- **Endpoint:** `POST /api/v1/jobs`
- **Access:** Authenticated (`EMPLOYER`, `ADMIN`)
- **Request Body:**
```json
{
  "title": "Senior Chemistry Faculty (NEET)",
  "subject": "Chemistry",
  "teachingLevel": "COACHING_NEET",
  "board": "CBSE",
  "experienceRequired": 4,
  "minSalary": 800000,
  "maxSalary": 1400000,
  "vacanciesCount": 2,
  "deadline": "2026-12-31",
  "description": "Seeking expert Chemistry faculty for NEET medical aspirants..."
}
```

---

## 4. Candidate Applications & ATS Scoring (`/api/v1/applications`)

### 4.1 Submit Job Application
- **Endpoint:** `POST /api/v1/applications/apply`
- **Access:** Authenticated (`TEACHER`)
- **Request Body:**
```json
{
  "jobId": "job-101",
  "coverNote": "Passionate Physics educator with 5+ years of NEET coaching experience.",
  "resumeBase64": "data:application/pdf;base64,JVBERi0xLjQK...",
  "resumeFileName": "Priya_Sharma_CV.pdf"
}
```

### 4.2 Recruiter Candidates by Job (Tiered Access Enforced)
- **Endpoint:** `GET /api/v1/applications/job/:jobId`
- **Access:** Authenticated (`EMPLOYER` owner, `ADMIN`, `HR`)
- **Response (Free Employer, 5-Limit Enforced):**
```json
{
  "success": true,
  "total": 14,
  "unlockedCount": 5,
  "lockedCount": 9,
  "accessControl": {
    "isPremium": false,
    "freeLimit": 5,
    "hasUnlimitedAccess": false
  },
  "candidates": [
    {
      "id": "app-001",
      "candidateName": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "+91 9876543210",
      "resumeUrl": "/uploads/resumes/cv-101.pdf",
      "score": 92,
      "isLocked": false
    },
    {
      "id": "app-006",
      "candidateName": "Candidate #6 (Locked)",
      "email": "c***@***.com",
      "phone": "**********",
      "resumeUrl": null,
      "score": 85,
      "isLocked": true
    }
  ]
}
```

---

## 5. Subscriptions & Access Management (`/api/v1/subscriptions`)

### 5.1 Get Available Plans
- **Endpoint:** `GET /api/v1/subscriptions/plans`
- **Access:** Public / Authenticated

### 5.2 Recruiter Active Subscription Status
- **Endpoint:** `GET /api/v1/subscriptions/my-subscription`
- **Access:** Authenticated (`EMPLOYER`)

### 5.3 Admin View All Job Posters & Subscription Quotas
- **Endpoint:** `GET /api/v1/subscriptions/admin/posters`
- **Access:** Authenticated (`ADMIN`)

### 5.4 Admin Override Access & Free Limits
- **Endpoint:** `POST /api/v1/subscriptions/admin/override-access`
- **Access:** Authenticated (`ADMIN`)
```json
{
  "employerId": "usr-emp-101",
  "grantUnlimited": true,
  "reason": "Institutional pilot partner partnership"
}
```

