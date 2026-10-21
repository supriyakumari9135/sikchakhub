import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api/v1';

async function api(endpoint: string, options: any = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

test('SikshaHub End-to-End Recruitment Platform & Database Persistence Workflow', async () => {
  try {
    // 1. Teacher Authentication
    const teacherLogin = await api('/auth/login', {
      method: 'POST',
      body: {
        email: 'teacher@sikchakhub.com',
        password: 'password123',
      },
    });
    assert.strictEqual(teacherLogin.ok, true, 'Teacher login successful');
    assert.ok(teacherLogin.data.token, 'Teacher JWT token received');
    assert.strictEqual(teacherLogin.data.user.role, 'TEACHER', 'User role is TEACHER');
    const teacherToken = teacherLogin.data.token;
    const teacherId = teacherLogin.data.user.id;

    // 2. Employer Authentication
    const employerLogin = await api('/auth/login', {
      method: 'POST',
      body: {
        email: 'recruiter@apexjee.com',
        password: 'password123',
      },
    });
    assert.strictEqual(employerLogin.ok, true, 'Employer login successful');
    assert.ok(employerLogin.data.token, 'Employer JWT token received');
    assert.strictEqual(employerLogin.data.user.role, 'EMPLOYER', 'User role is EMPLOYER');
    const employerToken = employerLogin.data.token;

    // 3. Teacher views live job vacancies
    const jobsRes = await api('/jobs');
    assert.strictEqual(jobsRes.ok, true, 'Job vacancies retrieved');
    assert.ok(jobsRes.data.jobs.length > 0, 'Found real job vacancies in database');
    const targetJob = jobsRes.data.jobs.find((j: any) => j.id === 'job-4') || jobsRes.data.jobs.find((j: any) => j.status === 'ACTIVE' && j.id !== 'job-1');

    // Connect to MongoDB Atlas to clean prior run test data for idempotent testing
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (mongoUri && mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('jobapplications').deleteMany({
        teacherId,
        jobId: targetJob.id,
      });
    }

    // 4. Teacher applies for active vacancy
    const applyRes = await api('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        jobId: targetJob.id,
        coverLetter: 'I am delighted to apply for this senior physics educator opening.',
        resumeUrl: 'https://sikchakhub.ai/resumes/dr_rajesh_sharma_cv.pdf',
        customAnswers: { q1: 8, q2: 'IIT-JEE top rank mentor' },
      },
    });
    assert.strictEqual(applyRes.status, 201, 'Application submitted with 201 status');
    assert.strictEqual(applyRes.data.success, true, 'Backend returned application success');
    const appId = applyRes.data.application.id;
    assert.ok(appId, 'Application received unique persistent ID');

    // 5. Verify database persistence in MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      const savedDoc = await mongoose.connection.db.collection('jobapplications').findOne({ id: appId });
      assert.ok(savedDoc !== null, 'Application document found directly in MongoDB Atlas');
      assert.strictEqual(savedDoc?.jobId, targetJob.id, 'Persisted jobId matches');
      assert.strictEqual(savedDoc?.teacherId, teacherId, 'Persisted teacherId matches');
    }

    // 6. Duplicate application prevention
    const dupRes = await api('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        jobId: targetJob.id,
        coverLetter: 'Duplicate attempt',
        resumeUrl: 'https://sikchakhub.ai/resumes/dr_rajesh_sharma_cv.pdf',
      },
    });
    assert.strictEqual(dupRes.status, 400, 'Duplicate submission rejected with 400');
    assert.strictEqual(dupRes.data.success, false, 'Duplicate response marked failure');

    // 7. Employer candidate management list
    const candidatesRes = await api(`/applications/job/${targetJob.id}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(candidatesRes.ok, true, 'Employer candidate list retrieved');
    const foundInEmployerList = candidatesRes.data.candidates.some((c: any) => c.id === appId);
    assert.strictEqual(foundInEmployerList, true, 'New application listed in employer candidate pipeline');

    // 8. Employer View Profile functionality
    const viewProfileRes = await api(`/applications/${appId}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(viewProfileRes.ok, true, 'Candidate application profile loaded');
    assert.ok(viewProfileRes.data.application.teacher?.fullName, 'Candidate full name loaded');
    assert.ok(viewProfileRes.data.application.teacher?.profile?.highestQualification, 'Qualifications loaded');

    // 9. Authorized CV access
    const cvRes = await api(`/applications/${appId}/resume`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(cvRes.ok, true, 'Authorized CV access succeeded');
    assert.ok(cvRes.data.resumeUrl, 'Resume URL verified');

    // 10. Status change: Under Review (SCREENING)
    const underReviewRes = await api(`/applications/${appId}/stage`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: { stage: 'Under Review' },
    });
    assert.strictEqual(underReviewRes.ok, true, 'Under Review status change accepted');
    assert.strictEqual(underReviewRes.data.application.stage, 'SCREENING', 'Stage persisted as SCREENING in database');

    // 11. Status change: SHORTLISTED
    const shortlistRes = await api(`/applications/${appId}/stage`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: { stage: 'SHORTLISTED' },
    });
    assert.strictEqual(shortlistRes.ok, true, 'Shortlisted status change accepted');
    assert.strictEqual(shortlistRes.data.application.stage, 'SHORTLISTED', 'Stage persisted as SHORTLISTED in database');

    // 12. Candidate sees updated status in My Applications
    const myAppsRes = await api('/applications/my-applications', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert.strictEqual(myAppsRes.ok, true, 'Candidate retrieved my-applications');
    const candidateApp = myAppsRes.data.applications.find((a: any) => a.id === appId);
    assert.ok(candidateApp, 'Candidate finds their application');
    assert.strictEqual(candidateApp.stage, 'SHORTLISTED', 'Candidate observes SHORTLISTED status');

    // 13. Employer Dashboard KPI metrics
    const statsRes = await api('/applications/stats/employer', {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(statsRes.ok, true, 'Employer KPI stats retrieved');
    assert.ok(statsRes.data.stats.totalApplicants >= 1, 'Total applicants counted');
    assert.ok(statsRes.data.stats.shortlistedPool >= 1, 'Shortlisted pool counted');

    // 14. Schedule Interview round
    const interviewRes = await api('/interviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: {
        applicationId: appId,
        interviewType: 'DEMO_CLASS',
        scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        durationMinutes: 45,
        meetingLink: 'https://meet.google.com/sik-rec-demo',
        locationDetails: 'Online Virtual Classroom',
      },
    });
    assert.strictEqual(interviewRes.status, 201, 'Interview created with 201');
    assert.ok(interviewRes.data.interview.id, 'Interview ID generated');

    // 15. Candidate views scheduled interview in portal
    const myInterviewsRes = await api('/interviews/my-interviews', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert.strictEqual(myInterviewsRes.ok, true, 'Candidate interviews retrieved');
    const foundInterview = myInterviewsRes.data.interviews.some((i: any) => i.applicationId === appId);
    assert.strictEqual(foundInterview, true, 'Scheduled interview visible to candidate');

    // 16. Security check: Unauthorized access prevention
    const otherTeacherLogin = await api('/auth/login', {
      method: 'POST',
      body: {
        email: 'ananya.sen@gmail.com',
        password: 'password123',
      },
    });
    const otherToken = otherTeacherLogin.data.token;
    const unauthorizedView = await api(`/applications/${appId}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.strictEqual(unauthorizedView.status, 403, 'Unauthorized access correctly rejected with 403 Forbidden');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
});
