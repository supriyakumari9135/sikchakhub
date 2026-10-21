import { PrismaClient } from '@prisma/client';
import { 
  SEED_USERS, 
  SEED_TEACHER_PROFILES, 
  SEED_INSTITUTIONS, 
  SEED_JOBS, 
  SEED_APPLICATIONS, 
  SEED_INTERVIEWS 
} from './seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SikshaHub database...');

  // Upsert users
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash || 'demo123',
        fullName: u.fullName,
        role: u.role,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        isVerified: u.isVerified,
      },
    });

    // Profile if teacher
    const profile = SEED_TEACHER_PROFILES[u.id];
    if (profile) {
      await prisma.teacherProfile.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          id: profile.id,
          userId: u.id,
          headline: profile.headline,
          bio: profile.bio,
          experienceYears: profile.experienceYears,
          highestQualification: profile.highestQualification,
          teachingLevels: JSON.stringify(profile.teachingLevels),
          subjects: JSON.stringify(profile.subjects),
          boards: JSON.stringify(profile.boards),
          currentCity: profile.currentCity,
          preferredCities: JSON.stringify(profile.preferredCities),
          isWillingToRelocate: profile.isWillingToRelocate,
          currentSalaryLPA: profile.currentSalaryLPA,
          expectedSalaryLPA: profile.expectedSalaryLPA,
          noticePeriodDays: profile.noticePeriodDays,
          resumeUrl: profile.resumeUrl,
          resumeFileName: profile.resumeFileName,
          skills: JSON.stringify(profile.skills),
          certifications: JSON.stringify(profile.certifications),
          profileCompletionScore: profile.profileCompletionScore,
          streakDays: profile.streakDays,
        },
      });
    }
  }

  // Upsert institutions
  for (const inst of SEED_INSTITUTIONS) {
    await prisma.institution.upsert({
      where: { id: inst.id },
      update: {},
      create: {
        id: inst.id,
        ownerId: inst.ownerId,
        name: inst.name,
        type: inst.type,
        logoUrl: inst.logoUrl,
        website: inst.website,
        description: inst.description,
        affiliationNumber: inst.affiliationNumber,
        verificationStatus: inst.verificationStatus,
        verificationNotes: inst.verificationNotes,
        address: inst.address,
        city: inst.city,
        state: inst.state,
        pincode: inst.pincode,
        establishedYear: inst.establishedYear,
      },
    });
  }

  // Upsert jobs
  for (const job of SEED_JOBS) {
    await prisma.jobVacancy.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        institutionId: job.institutionId,
        title: job.title,
        department: job.department,
        subject: job.subject,
        additionalSubjects: JSON.stringify(job.additionalSubjects || []),
        teachingLevel: job.teachingLevel,
        board: job.board,
        employmentType: job.employmentType,
        minExperienceYears: job.minExperienceYears,
        maxExperienceYears: job.maxExperienceYears,
        requiredQualification: job.requiredQualification,
        description: job.description,
        responsibilities: JSON.stringify(job.responsibilities || []),
        benefits: JSON.stringify(job.benefits || []),
        minSalaryLPA: job.minSalaryLPA,
        maxSalaryLPA: job.maxSalaryLPA,
        city: job.city,
        state: job.state,
        vacanciesCount: job.vacanciesCount,
        deadline: job.deadline,
        status: job.status,
        customFields: JSON.stringify(job.customFields || []),
        screeningRules: JSON.stringify(job.screeningRules || {}),
      },
    });
  }

  // Upsert applications
  for (const app of SEED_APPLICATIONS) {
    await prisma.jobApplication.upsert({
      where: {
        jobId_teacherId: {
          jobId: app.jobId,
          teacherId: app.teacherId,
        },
      },
      update: {},
      create: {
        id: app.id,
        jobId: app.jobId,
        teacherId: app.teacherId,
        resumeUrl: app.resumeUrl,
        coverLetter: app.coverLetter,
        stage: app.stage,
        customAnswers: JSON.stringify(app.customAnswers || {}),
        matchResult: JSON.stringify(app.matchResult || {}),
        recruiterNotes: app.recruiterNotes,
      },
    });
  }

  // Upsert interviews
  for (const interview of SEED_INTERVIEWS) {
    await prisma.interview.upsert({
      where: { id: interview.id },
      update: {},
      create: {
        id: interview.id,
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        teacherId: interview.teacherId,
        institutionId: interview.institutionId,
        interviewType: interview.interviewType,
        scheduledTime: interview.scheduledTime,
        durationMinutes: interview.durationMinutes,
        meetingLink: interview.meetingLink,
        locationDetails: interview.locationDetails,
        status: interview.status,
        feedback: interview.feedback,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
