import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { 
  DeviceTokenModel, 
  PlatformNotificationModel, 
  TeacherProfileModel, 
  UserInboxNotificationModel, 
  UserModel 
} from '../db/mongodb';

export interface SmartPushFilters {
  state?: string;
  city?: string;
  minSalaryLPA?: number;
  maxSalaryLPA?: number;
  teachingLevels?: string[];
  subjects?: string[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  isFresherOnly?: boolean;
}

export interface DispatchNotificationOptions {
  title: string;
  message: string;
  actionUrl?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  filters?: SmartPushFilters;
  sentBy?: string;
  targetAudience?: 'ALL' | 'TEACHERS' | 'EMPLOYERS';
}

class FCMService {
  private isInitialized = false;
  private app: App | null = null;

  constructor() {
    this.initFirebase();
  }

  /**
   * Safe Firebase Admin SDK Initialization
   * Looks for service account JSON or environment variables.
   * Gracefully falls back to web simulator if not configured.
   */
  public initFirebase() {
    const existingApps = getApps();
    if (this.isInitialized || existingApps.length > 0) {
      this.app = existingApps[0] || null;
      this.isInitialized = true;
      return;
    }

    try {
      // 1. Try FIREBASE_SERVICE_ACCOUNT (raw JSON string or file path)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        let certObj: any = null;
        if (process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
          certObj = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
          certObj = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8'));
        }

        if (certObj) {
          this.app = initializeApp({
            credential: cert(certObj),
          });
          this.isInitialized = true;
          console.log('✅ Firebase Admin SDK initialized successfully via FIREBASE_SERVICE_ACCOUNT.');
          return;
        }
      }

      // 2. Try individual environment variables
      if (
        process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        this.app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
        this.isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully via environment variables.');
        return;
      }

      // 3. Try local service account file in workspace root or backend dir
      const candidatePaths = [
        path.join(process.cwd(), 'firebase-service-account.json'),
        path.join(process.cwd(), '../firebase-service-account.json'),
        path.join(__dirname, '../../firebase-service-account.json'),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const certObj = JSON.parse(fs.readFileSync(p, 'utf8'));
          this.app = initializeApp({
            credential: cert(certObj),
          });
          this.isInitialized = true;
          console.log(`✅ Firebase Admin SDK initialized from ${p}`);
          return;
        }
      }

      // 4. Default Project ID initialization
      if (process.env.FIREBASE_PROJECT_ID && !this.isInitialized) {
        this.app = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        this.isInitialized = true;
        console.log(`✅ Firebase Admin SDK initialized with project ID: ${process.env.FIREBASE_PROJECT_ID}`);
        return;
      }

      console.info('ℹ️ Firebase Admin SDK: No credentials found in environment. Operating in Smart Push simulation & In-App delivery mode.');
    } catch (err: any) {
      console.warn('⚠️ Firebase Admin SDK initialization warning:', err.message);
    }
  }

  public isFcmActive(): boolean {
    return this.isInitialized && !!this.app;
  }

  /**
   * Smart Targeting Query Engine
   * Finds matching educators based on Location, Salary, Level, Subject, Experience.
   */
  public async findEligibleJobSeekers(filters: SmartPushFilters = {}): Promise<{
    matchedProfiles: any[];
    matchedUserIds: string[];
    totalMatchedCount: number;
    deviceTokens: string[];
    tokenCount: number;
  }> {
    const profileFilter: any = {};

    // 1. Location Matching: City
    if (filters.city && filters.city.trim() && filters.city !== 'ALL') {
      const cityRegex = new RegExp(filters.city.trim(), 'i');
      profileFilter.$or = [
        { currentCity: cityRegex },
        { preferredCities: cityRegex },
      ];
    }

    // 2. Teaching Level Matching (PRT, TGT, PGT, etc.)
    if (filters.teachingLevels && filters.teachingLevels.length > 0 && !filters.teachingLevels.includes('ALL')) {
      profileFilter.teachingLevels = { $in: filters.teachingLevels };
    }

    // 3. Subject Matching (Physics, Chemistry, Maths, etc.)
    if (filters.subjects && filters.subjects.length > 0 && !filters.subjects.includes('ALL')) {
      const subjectRegexes = filters.subjects.map(s => new RegExp(`^${s.trim()}$`, 'i'));
      profileFilter.subjects = { $in: subjectRegexes };
    }

    // 4. Experience Matching (Fresher or Experience Range)
    if (filters.isFresherOnly) {
      profileFilter.experienceYears = 0;
    } else if (filters.minExperienceYears != null || filters.maxExperienceYears != null) {
      const expRange: any = {};
      if (filters.minExperienceYears != null && filters.minExperienceYears >= 0) {
        expRange.$gte = Number(filters.minExperienceYears);
      }
      if (filters.maxExperienceYears != null && filters.maxExperienceYears <= 50) {
        expRange.$lte = Number(filters.maxExperienceYears);
      }
      if (Object.keys(expRange).length > 0) {
        profileFilter.experienceYears = expRange;
      }
    }

    // 5. Salary Matching (Expected Salary Range LPA)
    if (filters.minSalaryLPA != null || filters.maxSalaryLPA != null) {
      const salaryRange: any = {};
      if (filters.minSalaryLPA != null && filters.minSalaryLPA > 0) {
        salaryRange.$gte = Number(filters.minSalaryLPA);
      }
      if (filters.maxSalaryLPA != null && filters.maxSalaryLPA < 100) {
        salaryRange.$lte = Number(filters.maxSalaryLPA);
      }
      if (Object.keys(salaryRange).length > 0) {
        profileFilter.expectedSalaryLPA = salaryRange;
      }
    }

    // Query MongoDB Teacher Profiles
    let matchedProfiles: any[] = [];
    try {
      matchedProfiles = await TeacherProfileModel.find(profileFilter).lean();
    } catch (err) {
      console.warn('Error querying TeacherProfileModel:', err);
    }

    // Filter by State if specified
    let matchedUserIds = matchedProfiles.map(p => p.userId);

    if (filters.state && filters.state.trim() && filters.state !== 'ALL') {
      try {
        const stateRegex = new RegExp(filters.state.trim(), 'i');
        const stateUsers = await UserModel.find({
          id: { $in: matchedUserIds },
          role: 'TEACHER',
          $or: [
            { state: stateRegex },
            { city: stateRegex }
          ]
        }, 'id').lean();

        const stateUserIds = new Set(stateUsers.map(u => u.id));
        matchedProfiles = matchedProfiles.filter(p => stateUserIds.has(p.userId));
        matchedUserIds = matchedProfiles.map(p => p.userId);
      } catch (stateErr) {
        console.warn('Error applying state filter:', stateErr);
      }
    }

    // If no specific filters were applied, ensure we also include any registered teachers without an extended profile
    if (Object.keys(profileFilter).length === 0 && (!filters.state || filters.state === 'ALL')) {
      try {
        const allTeachers = await UserModel.find({ role: 'TEACHER' }, 'id').lean();
        const allTeacherIds = allTeachers.map(u => u.id);
        matchedUserIds = Array.from(new Set([...matchedUserIds, ...allTeacherIds]));
      } catch (err) {}
    }

    // Find active FCM Device Tokens for the matched educators
    let deviceTokens: string[] = [];
    if (matchedUserIds.length > 0) {
      try {
        const tokenDocs = await DeviceTokenModel.find({
          userId: { $in: matchedUserIds },
          isActive: true,
        }).lean();
        deviceTokens = Array.from(new Set(tokenDocs.map(d => d.token)));
      } catch (tokenErr) {
        console.warn('Error querying DeviceTokenModel:', tokenErr);
      }
    }

    return {
      matchedProfiles,
      matchedUserIds,
      totalMatchedCount: matchedUserIds.length,
      deviceTokens,
      tokenCount: deviceTokens.length,
    };
  }

  /**
   * Dispatch Push Notification to Target Audience
   */
  public async dispatchNotification(options: DispatchNotificationOptions): Promise<{
    notification: any;
    audienceCount: number;
    tokensCount: number;
    successDeliveries: number;
    failedDeliveries: number;
    fcmSent: boolean;
  }> {
    const { 
      title, 
      message, 
      actionUrl = '/teacher-dashboard', 
      priority = 'MEDIUM', 
      filters = {}, 
      sentBy = 'Super Admin',
      targetAudience = 'TEACHERS'
    } = options;

    // 1. Identify matched audience & tokens
    const { matchedUserIds, totalMatchedCount, deviceTokens, tokenCount } = 
      await this.findEligibleJobSeekers(filters);

    let successDeliveries = 0;
    let failedDeliveries = 0;
    let fcmSent = false;
    const staleTokens: string[] = [];

    // 2. Dispatch via Firebase Admin SDK if active and tokens exist
    if (this.isFcmActive() && deviceTokens.length > 0) {
      try {
        // FCM batches up to 500 tokens per multicast
        const CHUNK_SIZE = 500;
        for (let i = 0; i < deviceTokens.length; i += CHUNK_SIZE) {
          const chunk = deviceTokens.slice(i, i + CHUNK_SIZE);

          const multicastMessage: MulticastMessage = {
            tokens: chunk,
            notification: {
              title,
              body: message,
            },
            data: {
              actionUrl: actionUrl || '/teacher-dashboard',
              priority,
              platform: 'SIKCHAKHUB_AI',
            },
            webpush: {
              fcmOptions: {
                link: actionUrl || '/teacher-dashboard',
              },
              notification: {
                title,
                body: message,
                icon: '/logo.jpeg',
                badge: '/logo.jpeg',
              },
            },
          };

          const messaging = getMessaging(this.app!);
          const response = await messaging.sendEachForMulticast(multicastMessage);
          successDeliveries += response.successCount;
          failedDeliveries += response.failureCount;
          fcmSent = true;

          // Track invalid or unregistered tokens for automatic cleanup
          response.responses.forEach((resp: any, idx: number) => {
            if (!resp.success && resp.error) {
              const code = resp.error.code;
              if (
                code === 'messaging/registration-token-not-registered' ||
                code === 'messaging/invalid-registration-token'
              ) {
                staleTokens.push(chunk[idx]);
              }
            }
          });
        }

        // Clean up stale tokens
        if (staleTokens.length > 0) {
          await DeviceTokenModel.updateMany(
            { token: { $in: staleTokens } },
            { $set: { isActive: false, updatedAt: new Date() } }
          );
        }
      } catch (fcmErr: any) {
        console.error('FCM Multicast Dispatch error:', fcmErr);
        failedDeliveries += deviceTokens.length;
      }
    } else {
      // In-app & simulated delivery mode:
      // If no live FCM tokens or in dev mode, all matched educators receive the notification in their in-app inbox
      successDeliveries = totalMatchedCount;
      failedDeliveries = 0;
      fcmSent = false;
    }

    // 3. Create In-App Inbox notifications for all matched educators
    const broadcastId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (matchedUserIds.length > 0) {
      const inboxDocs = matchedUserIds.map(uid => ({
        id: `inbox-${Date.now()}-${uid}-${Math.random().toString(36).substring(2, 5)}`,
        userId: uid,
        broadcastId,
        title,
        message,
        actionUrl,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      try {
        await UserInboxNotificationModel.insertMany(inboxDocs, { ordered: false });
      } catch (inboxErr) {
        console.warn('Inbox notifications insert warning:', inboxErr);
      }
    }

    // 4. Save Notification History in PlatformNotificationModel
    const status = failedDeliveries > 0 && successDeliveries === 0 
      ? 'FAILED' 
      : failedDeliveries > 0 
      ? 'PARTIAL' 
      : 'DELIVERED';

    const rawPriority = String(priority || 'MEDIUM').toUpperCase();
    const safePriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(rawPriority)
      ? rawPriority
      : 'MEDIUM';

    const notificationDoc = {
      id: broadcastId,
      title,
      message,
      actionUrl,
      targetAudience,
      type: 'SMART_PUSH',
      priority: safePriority,
      filters,
      totalMatchedAudience: totalMatchedCount,
      successDeliveries,
      failedDeliveries,
      fcmSent,
      deliveryDetails: {
        totalTokensTargeted: tokenCount,
        fcmActive: this.isFcmActive(),
        staleTokensPruned: staleTokens.length,
      },
      sentBy,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await PlatformNotificationModel.create(notificationDoc);
    } catch (saveErr) {
      console.warn('Error saving PlatformNotification:', saveErr);
    }

    return {
      notification: notificationDoc,
      audienceCount: totalMatchedCount,
      tokensCount: tokenCount,
      successDeliveries,
      failedDeliveries,
      fcmSent,
    };
  }
}

export const fcmService = new FCMService();
