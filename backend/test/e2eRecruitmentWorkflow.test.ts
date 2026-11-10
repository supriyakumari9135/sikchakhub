import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import app from '../src/index';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

test('SikchaKhub End-to-End Real Recruitment Platform & Database Persistence Workflow', async () => {
  let server: http.Server | null = null;
  let baseUrl = '';

  const cleanupIds: { users: string[]; jobs: string[]; applications: string[]; institutions: string[]; interviews: string[] } = {
    users: [],
    jobs: [],
    applications: [],
    institutions: [],
    interviews: [],
  };

  try {
    // 0. Start dynamic HTTP server for testing
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server!.address() as any;
        baseUrl = `http://localhost:${address.port}/api/v1`;
        resolve();
      });
    });

    const api = async (endpoint: string, options: any = {}) => {
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
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
    };

    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (mongoUri && mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const testTimestamp = Date.now();

    // 1. Register Real Teacher
    const teacherEmail = `e2e_teacher_${testTimestamp}@example.com`;
    const teacherPassword = 'Password123!@#';
    const teacherRegRes = await api('/auth/register', {
      method: 'POST',
      body: {
        email: teacherEmail,
        password: teacherPassword,
        fullName: 'Dr. Test Senior Educator',
        role: 'TEACHER',
        city: 'Kota',
        subject: 'Physics',
      },
    });
    assert.strictEqual(teacherRegRes.ok, true, 'Teacher registration successful');
    assert.ok(teacherRegRes.data.token, 'Teacher JWT token received');
    assert.strictEqual(teacherRegRes.data.user.role, 'TEACHER', 'Registered role is TEACHER');
    const teacherToken = teacherRegRes.data.token;
    const teacherId = teacherRegRes.data.user.id;
    cleanupIds.users.push(teacherId);

    // 2. Register Real Employer
    const employerEmail = `e2e_employer_${testTimestamp}@example.com`;
    const employerPassword = 'Password123!@#';
    const employerRegRes = await api('/auth/register', {
      method: 'POST',
      body: {
        email: employerEmail,
        password: employerPassword,
        fullName: 'Principal Test Sharma',
        organizationName: 'Kota Premier Science Academy',
        role: 'EMPLOYER',
        city: 'Kota',
      },
    });
    assert.strictEqual(employerRegRes.ok, true, 'Employer registration successful');
    assert.ok(employerRegRes.data.token, 'Employer JWT token received');
    assert.strictEqual(employerRegRes.data.user.role, 'EMPLOYER', 'Registered role is EMPLOYER');
    const employerToken = employerRegRes.data.token;
    const employerId = employerRegRes.data.user.id;
    cleanupIds.users.push(employerId);

    // 3. Employer posts a real job vacancy
    const postJobRes = await api('/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: {
        title: 'Senior JEE Advanced Physics Faculty',
        subject: 'Physics',
        teachingLevel: 'COACHING_JEE',
        board: 'OTHER',
        employmentType: 'FULL_TIME',
        minExperienceYears: 4,
        requiredQualification: 'M.Sc Physics',
        description: 'Lead JEE Advanced batches for top percentile engineering aspirants.',
        minSalaryLPA: 18,
        maxSalaryLPA: 28,
        city: 'Kota',
        state: 'Rajasthan',
        vacanciesCount: 2,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    });
    assert.strictEqual(postJobRes.status, 201, 'Job created successfully with 201');
    assert.strictEqual(postJobRes.data.success, true, 'Job posting succeeded');
    const targetJob = postJobRes.data.job;
    assert.ok(targetJob.id, 'Job ID generated');
    cleanupIds.jobs.push(targetJob.id);
    if (targetJob.institutionId) {
      cleanupIds.institutions.push(targetJob.institutionId);
    }

    // 4. Teacher views live job vacancies
    const jobsRes = await api('/jobs');
    assert.strictEqual(jobsRes.ok, true, 'Job vacancies list retrieved');
    const foundJob = jobsRes.data.jobs.find((j: any) => j.id === targetJob.id);
    assert.ok(foundJob, 'Newly posted job visible in public vacancies listing');

    // 5. Teacher applies for active vacancy
    const applyRes = await api('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        jobId: targetJob.id,
        coverLetter: 'I am delighted to apply for this senior physics educator opening.',
        resumeUrl: 'https://sikchakhub.ai/resumes/test_cv.pdf',
        customAnswers: { q1: 6, q2: 'IIT-JEE top rank mentor' },
      },
    });
    assert.strictEqual(applyRes.status, 201, 'Application submitted with 201 status');
    assert.strictEqual(applyRes.data.success, true, 'Backend returned application success');
    const appId = applyRes.data.application.id;
    assert.ok(appId, 'Application received unique persistent ID');
    cleanupIds.applications.push(appId);

    // 6. Verify database persistence in MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      const savedDoc = await mongoose.connection.db.collection('jobapplications').findOne({ id: appId });
      assert.ok(savedDoc !== null, 'Application document found directly in MongoDB Atlas');
      assert.strictEqual(savedDoc?.jobId, targetJob.id, 'Persisted jobId matches');
      assert.strictEqual(savedDoc?.teacherId, teacherId, 'Persisted teacherId matches');
    }

    // 7. Duplicate application prevention
    const dupRes = await api('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        jobId: targetJob.id,
        coverLetter: 'Duplicate attempt',
        resumeUrl: 'https://sikchakhub.ai/resumes/test_cv.pdf',
      },
    });
    assert.strictEqual(dupRes.status, 400, 'Duplicate submission rejected with 400');
    assert.strictEqual(dupRes.data.success, false, 'Duplicate response marked failure');

    // 8. Employer candidate management list
    const candidatesRes = await api(`/applications/job/${targetJob.id}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(candidatesRes.ok, true, 'Employer candidate list retrieved');
    const foundInEmployerList = candidatesRes.data.candidates.some((c: any) => c.id === appId);
    assert.strictEqual(foundInEmployerList, true, 'New application listed in employer candidate pipeline');

    // 9. Employer View Profile functionality
    const viewProfileRes = await api(`/applications/${appId}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    assert.strictEqual(viewProfileRes.ok, true, 'Candidate application profile loaded');
    assert.ok(viewProfileRes.data.application.teacher?.fullName, 'Candidate full name loaded');

    // 10. Status change: SCREENING
    const screeningRes = await api(`/applications/${appId}/stage`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: { stage: 'SCREENING' },
    });
    assert.strictEqual(screeningRes.ok, true, 'Screening status change accepted');
    assert.strictEqual(screeningRes.data.application.stage, 'SCREENING', 'Stage persisted as SCREENING in database');

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
    cleanupIds.interviews.push(interviewRes.data.interview.id);

    // 15. Candidate views scheduled interview in portal
    const myInterviewsRes = await api('/interviews/my-interviews', {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert.strictEqual(myInterviewsRes.ok, true, 'Candidate interviews retrieved');
    const foundInterview = myInterviewsRes.data.interviews.some((i: any) => i.applicationId === appId);
    assert.strictEqual(foundInterview, true, 'Scheduled interview visible to candidate');

    // 16. Security check: Unauthorized access prevention by another teacher
    const otherTeacherEmail = `e2e_other_${testTimestamp}@example.com`;
    const otherReg = await api('/auth/register', {
      method: 'POST',
      body: {
        email: otherTeacherEmail,
        password: 'OtherPassword123!',
        fullName: 'Other Educator',
        role: 'TEACHER',
      },
    });
    const otherToken = otherReg.data.token;
    cleanupIds.users.push(otherReg.data.user.id);

    const unauthorizedView = await api(`/applications/${appId}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.strictEqual(unauthorizedView.status, 403, 'Unauthorized access correctly rejected with 403 Forbidden');

  } finally {
    // Clean up test documents created in MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      if (cleanupIds.applications.length > 0) {
        await mongoose.connection.db.collection('jobapplications').deleteMany({ id: { $in: cleanupIds.applications } });
      }
      if (cleanupIds.jobs.length > 0) {
        await mongoose.connection.db.collection('jobvacancies').deleteMany({ id: { $in: cleanupIds.jobs } });
      }
      if (cleanupIds.users.length > 0) {
        await mongoose.connection.db.collection('users').deleteMany({ id: { $in: cleanupIds.users } });
        await mongoose.connection.db.collection('teacherprofiles').deleteMany({ userId: { $in: cleanupIds.users } });
      }
      if (cleanupIds.institutions.length > 0) {
        await mongoose.connection.db.collection('institutions').deleteMany({ id: { $in: cleanupIds.institutions } });
      }
      if (cleanupIds.interviews.length > 0) {
        await mongoose.connection.db.collection('interviews').deleteMany({ id: { $in: cleanupIds.interviews } });
      }
      await mongoose.disconnect();
    }

    if (server) {
      await new Promise<void>((resolve) => {
        (server as http.Server).close(() => resolve());
      });
    }
  }
});
