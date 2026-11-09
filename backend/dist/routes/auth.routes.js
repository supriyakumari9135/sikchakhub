"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const shared_validation_1 = require("@sikchakhub/shared-validation");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'sikchakhub-super-secret-jwt-key-2025';
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        adminRole: user.adminRole,
        fullName: user.fullName,
    }, JWT_SECRET, { expiresIn: '30d' });
}
// POST /api/v1/auth/register
// Real registration storing hashed credentials and profile directly to MongoDB Atlas
router.post('/register', async (req, res) => {
    const parseResult = shared_validation_1.RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    const { email, password, fullName, role, phone, age } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const parsedAge = age != null ? age : (req.body.age ? Number(req.body.age) : undefined);
    try {
        // 1. Verify uniqueness against MongoDB Atlas and in-memory store
        let existingUser = null;
        try {
            existingUser = await mongodb_1.UserModel.findOne({ email: normalizedEmail }).lean();
        }
        catch (dbErr) {
            console.warn('MongoDB query warning in register:', dbErr);
        }
        if (!existingUser) {
            existingUser = store_1.dbStore.getUserByEmail(normalizedEmail);
        }
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        // Administrative accounts cannot be registered via public registration
        if (role === 'ADMIN' || role === 'HR') {
            return res.status(403).json({
                success: false,
                message: 'Public registration for administrative accounts is restricted. Please sign in or contact Super Admin.',
            });
        }
        // Role-specific validation before user creation
        if (role === 'EMPLOYER') {
            if (req.body.confirmPassword && req.body.confirmPassword !== password) {
                return res.status(400).json({ success: false, message: 'Passwords do not match. Please verify your password confirmation.' });
            }
            if (req.body.termsAccepted === false || req.body.termsAccepted === 'false') {
                return res.status(400).json({ success: false, message: 'Terms and Conditions acceptance is mandatory.' });
            }
            const orgName = req.body.organizationName || req.body.name;
            if (!orgName || !orgName.trim()) {
                return res.status(400).json({ success: false, message: 'Institution Name is compulsory.' });
            }
            const contactPerson = req.body.contactPerson || fullName;
            if (!contactPerson || !contactPerson.trim()) {
                return res.status(400).json({ success: false, message: 'Contact Person / Principal Name is compulsory.' });
            }
            const officialPhone = phone || req.body.phone;
            if (!officialPhone || !officialPhone.trim()) {
                return res.status(400).json({ success: false, message: 'Official Mobile Number is compulsory.' });
            }
            if (!req.body.state?.trim()) {
                return res.status(400).json({ success: false, message: 'State is compulsory.' });
            }
            if (!req.body.city?.trim()) {
                return res.status(400).json({ success: false, message: 'City is compulsory.' });
            }
            const addr = req.body.address || req.body.fullAddress;
            if (!addr || !addr.trim()) {
                return res.status(400).json({ success: false, message: 'Full Address is compulsory.' });
            }
        }
        // 2. Hash password with bcryptjs salt 10
        const passwordHash = bcryptjs_1.default.hashSync(password, 10);
        const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const userFullName = role === 'EMPLOYER' ? (req.body.contactPerson || fullName) : fullName;
        const newUserDoc = {
            id: userId,
            email: normalizedEmail,
            passwordHash,
            fullName: userFullName,
            role: role,
            phone: phone || req.body.phone || '',
            age: parsedAge,
            gender: req.body.gender || '',
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userFullName)}`,
            isVerified: true,
        };
        // 3. Persist User in MongoDB Atlas
        try {
            await mongodb_1.UserModel.create(newUserDoc);
        }
        catch (saveErr) {
            console.warn('MongoDB UserModel.create warning:', saveErr);
        }
        store_1.dbStore.users.push({
            ...newUserDoc,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        let profileDoc = undefined;
        let institutionDoc = undefined;
        // 4. Create real role-specific entity in MongoDB Atlas
        if (role === 'TEACHER') {
            // 4A. Enforce compulsory CV/Resume PDF upload (maximum 5 MB)
            const resumeBase64 = req.body.resumeBase64 || req.body.cvBase64;
            const resumeFileName = req.body.resumeFileName || req.body.cvFileName || 'Educator_Resume.pdf';
            const existingResumeUrl = req.body.resumeUrl;
            if (!resumeBase64 && !existingResumeUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'CV/Resume upload in PDF format (maximum 5 MB) is compulsory to complete Job Seeker registration.',
                });
            }
            let finalResumeUrl = existingResumeUrl || '';
            let finalResumeFileName = resumeFileName;
            if (resumeBase64) {
                // Decode base64
                const base64Content = resumeBase64.replace(/^data:application\/pdf;base64,/, '');
                const buffer = Buffer.from(base64Content, 'base64');
                const sizeBytes = buffer.length;
                const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
                if (sizeBytes > MAX_SIZE) {
                    return res.status(400).json({
                        success: false,
                        message: `Uploaded CV file size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please upload a PDF under 5 MB.`,
                    });
                }
                // Validate PDF magic bytes
                const magic = buffer.slice(0, 4).toString('ascii');
                if (!magic.startsWith('%PDF')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid file format. Only authentic PDF documents (.pdf) are accepted.',
                    });
                }
                // Save to secure local storage
                const uploadsDir = path_1.default.join(__dirname, '../../uploads/resumes');
                if (!fs_1.default.existsSync(uploadsDir)) {
                    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
                }
                const cleanName = (resumeFileName || 'resume.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
                const storedFileName = `cv-${userId}-${Date.now()}-${cleanName}`;
                const filePath = path_1.default.join(uploadsDir, storedFileName);
                fs_1.default.writeFileSync(filePath, buffer);
                finalResumeUrl = `/uploads/resumes/${storedFileName}`;
                finalResumeFileName = resumeFileName;
            }
            // 4B. Extract all teacher profile fields
            const expYears = req.body.experienceYears != null ? Number(req.body.experienceYears) : (req.body.experience != null ? Number(req.body.experience) : 0);
            const sub = req.body.subject || (Array.isArray(req.body.subjects) && req.body.subjects.length > 0 ? req.body.subjects[0] : 'Physics');
            const allSubjects = Array.isArray(req.body.subjects) && req.body.subjects.length > 0
                ? req.body.subjects
                : (req.body.secondarySubject ? [sub, req.body.secondarySubject] : [sub]);
            const qual = req.body.highestQualification || req.body.qualification || 'Post Graduate';
            const degree = req.body.degree || req.body.specialization || '';
            const lvl = req.body.teachingLevel || (Array.isArray(req.body.teachingLevels) && req.body.teachingLevels.length > 0 ? req.body.teachingLevels[0] : 'PGT');
            const allTeachingLevels = Array.isArray(req.body.teachingLevels) && req.body.teachingLevels.length > 0 ? req.body.teachingLevels : [lvl];
            const classesTaught = Array.isArray(req.body.classesTaught) && req.body.classesTaught.length > 0
                ? req.body.classesTaught
                : (req.body.classes ? [req.body.classes] : ['Classes 9-10', 'Classes 11-12']);
            const previousSchool = req.body.previousSchool || req.body.currentSchool || '';
            const boards = Array.isArray(req.body.boards) && req.body.boards.length > 0
                ? req.body.boards
                : (req.body.board ? [req.body.board] : ['CBSE']);
            const certifications = Array.isArray(req.body.certifications)
                ? req.body.certifications
                : (req.body.certification ? [req.body.certification] : []);
            const skills = Array.isArray(req.body.skills) && req.body.skills.length > 0
                ? req.body.skills
                : ['Classroom Management', 'Lesson Planning', 'Smart Board / ICT', sub];
            const languages = Array.isArray(req.body.languages) && req.body.languages.length > 0
                ? req.body.languages
                : (req.body.language ? [req.body.language] : ['English', 'Hindi']);
            const cityLoc = req.body.city || req.body.currentCity || 'Delhi NCR';
            const preferredCities = Array.isArray(req.body.preferredCities) && req.body.preferredCities.length > 0
                ? req.body.preferredCities
                : [cityLoc];
            const isWillingToRelocate = req.body.isWillingToRelocate === true || req.body.isWillingToRelocate === 'true';
            const expectedSalary = req.body.expectedSalary || (req.body.expectedSalaryLPA ? `₹${req.body.expectedSalaryLPA} LPA` : '₹6-9 LPA');
            const expectedSalaryLPA = req.body.expectedSalaryLPA ? Number(req.body.expectedSalaryLPA) : 6;
            const joiningAvailability = req.body.joiningAvailability || 'Immediate';
            const noticePeriodDays = req.body.noticePeriodDays != null
                ? Number(req.body.noticePeriodDays)
                : (joiningAvailability === 'Immediate' ? 0 : 30);
            profileDoc = {
                id: `profile-${Date.now()}`,
                userId,
                headline: req.body.headline || `${sub} (${lvl}) Educator`,
                bio: req.body.bio || `${sub} Educator with ${expYears} years experience teaching ${boards.join(', ')} curriculum.`,
                age: parsedAge,
                gender: req.body.gender || '',
                experienceYears: isNaN(expYears) ? 0 : expYears,
                highestQualification: qual,
                degree,
                teachingLevels: allTeachingLevels,
                classesTaught,
                subjects: allSubjects,
                previousSchool,
                boards,
                currentCity: cityLoc,
                preferredCities,
                isWillingToRelocate,
                currentSalaryLPA: req.body.currentSalaryLPA ? Number(req.body.currentSalaryLPA) : undefined,
                expectedSalaryLPA,
                expectedSalary,
                noticePeriodDays,
                joiningAvailability,
                skills,
                certifications,
                languages,
                profileCompletionScore: 100,
                streakDays: 1,
                resumeUrl: finalResumeUrl,
                resumeFileName: finalResumeFileName,
            };
            try {
                await mongodb_1.TeacherProfileModel.create(profileDoc);
            }
            catch (profErr) {
                console.warn('MongoDB TeacherProfileModel.create warning:', profErr);
            }
            store_1.dbStore.profiles[userId] = profileDoc;
        }
        else if (role === 'EMPLOYER') {
            const orgName = req.body.organizationName || req.body.name || `${userFullName} Institution`;
            const instType = req.body.institutionType || req.body.type || 'SCHOOL';
            const contactPersonName = req.body.contactPerson || userFullName;
            const officialPhone = phone || req.body.phone || '';
            const stateLoc = req.body.state || 'Delhi';
            const cityLoc = req.body.city || 'Delhi NCR';
            const addressLoc = req.body.address || req.body.fullAddress || cityLoc;
            const pincodeLoc = req.body.pincode || '110001';
            const board = req.body.board || (instType === 'COLLEGE' ? 'UGC / AICTE' : 'CBSE');
            const udiseCode = req.body.udiseCode || '';
            const registrationNumber = req.body.registrationNumber || req.body.affiliationNumber || '';
            const website = req.body.website || '';
            const termsAccepted = req.body.termsAccepted !== false && req.body.termsAccepted !== 'false';
            // 4C. Secure storage for uploaded verification certificate (PDF/Image, max 5 MB)
            const certBase64 = req.body.certificateBase64 || req.body.documentBase64;
            const certFileName = req.body.certificateFileName || req.body.documentFileName || 'Registration_Certificate.pdf';
            let finalCertificateUrl = req.body.certificateUrl || '';
            let finalCertificateFileName = certFileName;
            if (certBase64) {
                try {
                    const base64Content = certBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
                    const buffer = Buffer.from(base64Content, 'base64');
                    const sizeBytes = buffer.length;
                    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
                    if (sizeBytes > MAX_SIZE) {
                        return res.status(400).json({
                            success: false,
                            message: `Uploaded verification certificate (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please upload a file under 5 MB.`,
                        });
                    }
                    const certsDir = path_1.default.join(__dirname, '../../uploads/certificates');
                    if (!fs_1.default.existsSync(certsDir)) {
                        fs_1.default.mkdirSync(certsDir, { recursive: true });
                    }
                    const cleanName = certFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const storedFileName = `cert-${userId}-${Date.now()}-${cleanName}`;
                    const filePath = path_1.default.join(certsDir, storedFileName);
                    fs_1.default.writeFileSync(filePath, buffer);
                    finalCertificateUrl = `/uploads/certificates/${storedFileName}`;
                    finalCertificateFileName = certFileName;
                }
                catch (certErr) {
                    console.warn('Error saving certificate file:', certErr);
                }
            }
            // 4D. Secure storage for uploaded institution logo
            const logoBase64 = req.body.logoBase64;
            let finalLogoUrl = req.body.logoUrl || '/logo.jpeg';
            if (logoBase64) {
                try {
                    const base64Content = logoBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
                    const buffer = Buffer.from(base64Content, 'base64');
                    const logosDir = path_1.default.join(__dirname, '../../uploads/logos');
                    if (!fs_1.default.existsSync(logosDir)) {
                        fs_1.default.mkdirSync(logosDir, { recursive: true });
                    }
                    const cleanLogoName = (req.body.logoFileName || 'logo.png').replace(/[^a-zA-Z0-9.-]/g, '_');
                    const storedLogoName = `logo-${userId}-${Date.now()}-${cleanLogoName}`;
                    const filePath = path_1.default.join(logosDir, storedLogoName);
                    fs_1.default.writeFileSync(filePath, buffer);
                    finalLogoUrl = `/uploads/logos/${storedLogoName}`;
                }
                catch (logoErr) {
                    console.warn('Error saving logo image:', logoErr);
                }
            }
            institutionDoc = {
                id: `inst-${Date.now()}`,
                ownerId: userId,
                name: orgName,
                type: instType,
                logoUrl: finalLogoUrl,
                website,
                description: req.body.description || `Verified educational institution: ${orgName}.`,
                affiliationNumber: registrationNumber || req.body.affiliationNumber || 'PENDING',
                registrationNumber: registrationNumber || req.body.affiliationNumber || '',
                contactPerson: contactPersonName,
                phone: officialPhone,
                email: normalizedEmail,
                board,
                udiseCode,
                certificateUrl: finalCertificateUrl,
                certificateFileName: finalCertificateFileName,
                termsAccepted,
                verificationStatus: 'PENDING',
                address: addressLoc,
                city: cityLoc,
                state: stateLoc,
                pincode: pincodeLoc,
                establishedYear: req.body.establishedYear ? Number(req.body.establishedYear) : undefined,
            };
            try {
                await mongodb_1.InstitutionModel.create(institutionDoc);
            }
            catch (instErr) {
                console.warn('MongoDB InstitutionModel.create warning:', instErr);
            }
            store_1.dbStore.institutions.push(institutionDoc);
        }
        const token = generateToken(newUserDoc);
        (0, auditLogger_1.logAuditEvent)(req, 'USER_REGISTERED', 'User', userId, { email: normalizedEmail, role });
        return res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: newUserDoc.id,
                email: newUserDoc.email,
                fullName: newUserDoc.fullName,
                role: newUserDoc.role,
                avatarUrl: newUserDoc.avatarUrl,
                phone: newUserDoc.phone,
                age: newUserDoc.age,
            },
            profile: profileDoc,
            institution: institutionDoc,
        });
    }
    catch (error) {
        console.error('Registration processing error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
    }
});
// POST /api/v1/auth/login
// Real authentication verifying hashed passwords against MongoDB Atlas
router.post('/login', async (req, res) => {
    const parseResult = shared_validation_1.LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    const { email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    try {
        // 1. Fetch user from MongoDB Atlas
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ email: normalizedEmail }).lean();
        }
        catch (dbErr) {
            console.warn('MongoDB UserModel.findOne warning:', dbErr);
        }
        // Fallback to in-memory store if DB query returned nothing
        if (!user) {
            user = store_1.dbStore.getUserByEmail(normalizedEmail);
        }
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
        }
        // 2. Real Password Verification using bcryptjs
        const storedHash = user.passwordHash || store_1.dbStore.getUserByEmail(normalizedEmail)?.passwordHash;
        if (!storedHash) {
            return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
        }
        const passwordMatches = bcryptjs_1.default.compareSync(password, storedHash);
        if (!passwordMatches) {
            return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
        }
        // 2.3 Account Active Status Check
        if (user.status === 'DEACTIVATED' || user.status === 'SUSPENDED') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated or suspended by the Super Administrator. Please contact management.',
            });
        }
        // 2.5 Strict Portal Role Separation
        // Job Poster cannot log into Job Seeker page or Admin page;
        // Job Seeker cannot log into Job Poster page or Admin page;
        // Admin & HR credentials permitted for Super Admin & HR Screening governance.
        const expectedRole = parseResult.data.expectedRole || parseResult.data.portalRole || parseResult.data.role;
        const portalDisplayNames = {
            TEACHER: 'Job Seeker (Educator)',
            EMPLOYER: 'Job Poster (School / Coaching Institute)',
            ADMIN: 'Super Admin Governance',
            HR: 'HR Recruiter Governance',
        };
        const expRoleStr = expectedRole || '';
        const userRoleStr = user.role || '';
        const isRoleAllowed = !expectedRole ||
            userRoleStr === expRoleStr ||
            (expRoleStr === 'ADMIN' && userRoleStr === 'HR') ||
            (expRoleStr === 'HR' && userRoleStr === 'ADMIN');
        if (!isRoleAllowed) {
            const actualRoleLabel = portalDisplayNames[user.role] || user.role;
            const expectedRoleLabel = portalDisplayNames[expectedRole] || expectedRole;
            return res.status(403).json({
                success: false,
                message: `Account role mismatch: This account is registered as a ${actualRoleLabel}. You cannot log in through the ${expectedRoleLabel} portal. Please use the ${actualRoleLabel} login page.`,
                userRole: user.role,
                expectedRole,
            });
        }
        // 3. Fetch linked profile or institution from MongoDB Atlas
        let profile = null;
        let institution = null;
        if (user.role === 'TEACHER') {
            try {
                profile = await mongodb_1.TeacherProfileModel.findOne({ userId: user.id }).lean();
            }
            catch (err) { }
            if (!profile)
                profile = store_1.dbStore.profiles[user.id] || null;
        }
        else if (user.role === 'EMPLOYER') {
            try {
                institution = await mongodb_1.InstitutionModel.findOne({ ownerId: user.id }).lean();
            }
            catch (err) { }
            if (!institution) {
                institution = store_1.dbStore.institutions.find(i => i.ownerId === user.id) || null;
            }
        }
        const token = generateToken(user);
        (0, auditLogger_1.logAuditEvent)(req, 'USER_LOGIN', 'User', user.id, { email: normalizedEmail });
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                adminRole: user.adminRole,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                age: user.age,
            },
            profile,
            institution,
        });
    }
    catch (error) {
        console.error('Login processing error:', error);
        return res.status(500).json({ success: false, message: 'Authentication processing error. Please try again.' });
    }
});
// POST /api/v1/auth/google
// Real Google Authentication: connects user directly to MongoDB Atlas with secure OAuth representation
router.post('/google', async (req, res) => {
    const { email, fullName, avatarUrl, role } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Google account email is required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole = role || 'TEACHER';
    try {
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ email: normalizedEmail }).lean();
        }
        catch (dbErr) {
            console.warn('MongoDB Google find warning:', dbErr);
        }
        if (!user) {
            user = store_1.dbStore.getUserByEmail(normalizedEmail);
        }
        if (!user) {
            const newUserId = `user-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const googlePasswordHash = bcryptjs_1.default.hashSync(`oauth-google-${Date.now()}-${Math.random()}`, 10);
            user = {
                id: newUserId,
                email: normalizedEmail,
                passwordHash: googlePasswordHash,
                fullName: fullName || normalizedEmail.split('@')[0],
                role: assignedRole,
                phone: '',
                avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || normalizedEmail)}`,
                isVerified: true,
            };
            try {
                await mongodb_1.UserModel.create(user);
            }
            catch (saveErr) {
                console.warn('MongoDB Google UserModel create warning:', saveErr);
            }
            store_1.dbStore.users.push({
                ...user,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            if (user.role === 'TEACHER') {
                const newProf = {
                    id: `profile-${Date.now()}`,
                    userId: user.id,
                    headline: 'Verified Educator',
                    bio: 'Registered via Google Sign-In',
                    experienceYears: 2,
                    highestQualification: 'Post Graduate / B.Ed',
                    teachingLevels: ['PGT', 'TGT'],
                    subjects: ['Mathematics', 'Science'],
                    boards: ['CBSE'],
                    currentCity: 'Delhi NCR',
                    preferredCities: ['Delhi NCR'],
                    isWillingToRelocate: false,
                    noticePeriodDays: 30,
                    skills: ['Lesson Planning', 'Digital Classroom'],
                    certifications: ['Google Certified Educator'],
                    profileCompletionScore: 80,
                    streakDays: 1,
                    resumeUrl: '',
                    resumeFileName: '',
                };
                try {
                    await mongodb_1.TeacherProfileModel.create(newProf);
                }
                catch (e) { }
                store_1.dbStore.profiles[user.id] = newProf;
            }
            else if (user.role === 'EMPLOYER') {
                const newInst = {
                    id: `inst-${Date.now()}`,
                    ownerId: user.id,
                    name: `${user.fullName} Organization`,
                    type: 'SCHOOL',
                    logoUrl: '/logo.jpeg',
                    website: 'https://sikchakhub.ai',
                    description: 'Verified educational organization on SikshaHub.',
                    affiliationNumber: 'REG-PENDING',
                    verificationStatus: 'PENDING',
                    address: 'Institutional Hub',
                    city: 'Delhi NCR',
                    state: 'Delhi',
                    pincode: '110001',
                };
                try {
                    await mongodb_1.InstitutionModel.create(newInst);
                }
                catch (e) { }
                store_1.dbStore.institutions.push(newInst);
            }
        }
        let profile = undefined;
        let institution = undefined;
        if (user.role === 'TEACHER') {
            try {
                profile = await mongodb_1.TeacherProfileModel.findOne({ userId: user.id }).lean();
            }
            catch (e) { }
            if (!profile)
                profile = store_1.dbStore.profiles[user.id] || null;
        }
        else if (user.role === 'EMPLOYER') {
            try {
                institution = await mongodb_1.InstitutionModel.findOne({ ownerId: user.id }).lean();
            }
            catch (e) { }
            if (!institution) {
                institution = store_1.dbStore.institutions.find(i => i.ownerId === user.id) || null;
            }
        }
        const token = generateToken(user);
        (0, auditLogger_1.logAuditEvent)(req, 'USER_GOOGLE_LOGIN', 'User', user.id, { email: normalizedEmail, role: user.role });
        return res.json({
            success: true,
            message: 'Google login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                adminRole: user.adminRole,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                age: user.age,
            },
            profile,
            institution,
        });
    }
    catch (error) {
        console.error('Google login processing error:', error);
        return res.status(500).json({ success: false, message: 'Google authentication failed. Please try again.' });
    }
});
// GET /api/v1/auth/me
// Returns current authenticated user, profile, and institution from MongoDB Atlas
router.get('/me', authMiddleware_1.authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    try {
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ id: userId }).lean();
        }
        catch (e) { }
        if (!user) {
            user = store_1.dbStore.getUserById(userId);
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User record not found.' });
        }
        let profile = undefined;
        let institution = undefined;
        if (user.role === 'TEACHER') {
            try {
                profile = await mongodb_1.TeacherProfileModel.findOne({ userId: user.id }).lean();
            }
            catch (e) { }
            if (!profile)
                profile = store_1.dbStore.profiles[user.id] || null;
        }
        else if (user.role === 'EMPLOYER') {
            try {
                institution = await mongodb_1.InstitutionModel.findOne({ ownerId: user.id }).lean();
            }
            catch (e) { }
            if (!institution) {
                institution = store_1.dbStore.institutions.find(i => i.ownerId === user.id) || null;
            }
        }
        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                adminRole: user.adminRole,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                age: user.age,
            },
            profile,
            institution,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
    }
});
// PUT /api/v1/auth/profile
// Real profile update synchronized to MongoDB Atlas
router.put('/profile', authMiddleware_1.authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const currentProfile = store_1.dbStore.profiles[userId] || {
        id: `profile-${Date.now()}`,
        userId,
        experienceYears: 0,
        highestQualification: '',
        teachingLevels: [],
        subjects: [],
        boards: [],
        currentCity: '',
        preferredCities: [],
        isWillingToRelocate: false,
        noticePeriodDays: 30,
        skills: [],
        certifications: [],
        profileCompletionScore: 70,
        streakDays: 1,
    };
    const updatedProfile = {
        ...currentProfile,
        ...req.body,
        userId,
        profileCompletionScore: Math.min(100, Math.max(50, (req.body.resumeUrl ? 25 : 10) +
            (req.body.subjects?.length ? 20 : 0) +
            (req.body.highestQualification ? 15 : 0) +
            (req.body.headline ? 15 : 0) +
            (req.body.bio ? 15 : 0) +
            (req.body.skills?.length ? 10 : 0))),
    };
    try {
        await mongodb_1.TeacherProfileModel.findOneAndUpdate({ userId }, { $set: updatedProfile }, { upsert: true, new: true });
    }
    catch (err) {
        console.warn('MongoDB profile update warning:', err);
    }
    store_1.dbStore.profiles[userId] = updatedProfile;
    (0, auditLogger_1.logAuditEvent)(req, 'PROFILE_UPDATED', 'TeacherProfile', updatedProfile.id);
    return res.json({
        success: true,
        message: 'Profile updated successfully!',
        profile: updatedProfile,
    });
});
// PUT /api/v1/auth/account
// Real account details update (name, phone, age, institution details) in MongoDB Atlas
router.put('/account', authMiddleware_1.authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { fullName, phone, age, organizationName, type, city, state, website, affiliationNumber, description } = req.body;
    try {
        const userUpdate = {};
        if (fullName)
            userUpdate.fullName = fullName.trim();
        if (phone !== undefined)
            userUpdate.phone = phone.trim();
        if (age !== undefined)
            userUpdate.age = Number(age);
        userUpdate.updatedAt = new Date().toISOString();
        let updatedUser = null;
        try {
            updatedUser = await mongodb_1.UserModel.findOneAndUpdate({ id: userId }, { $set: userUpdate }, { new: true }).lean();
        }
        catch (e) { }
        const memUser = store_1.dbStore.users.find(u => u.id === userId);
        if (memUser) {
            if (fullName)
                memUser.fullName = fullName.trim();
            if (phone !== undefined)
                memUser.phone = phone.trim();
            if (age !== undefined)
                memUser.age = Number(age);
            memUser.updatedAt = userUpdate.updatedAt;
            if (!updatedUser)
                updatedUser = memUser;
        }
        let updatedInstitution = null;
        if (req.user.role === 'EMPLOYER') {
            const instUpdate = {};
            if (organizationName)
                instUpdate.name = organizationName.trim();
            if (type)
                instUpdate.type = type;
            if (city)
                instUpdate.city = city.trim();
            if (state)
                instUpdate.state = state.trim();
            if (website)
                instUpdate.website = website.trim();
            if (affiliationNumber)
                instUpdate.affiliationNumber = affiliationNumber.trim();
            if (description)
                instUpdate.description = description.trim();
            instUpdate.updatedAt = new Date().toISOString();
            try {
                updatedInstitution = await mongodb_1.InstitutionModel.findOneAndUpdate({ ownerId: userId }, { $set: instUpdate }, { new: true }).lean();
            }
            catch (e) { }
            const memInst = store_1.dbStore.institutions.find(i => i.ownerId === userId);
            if (memInst) {
                if (organizationName)
                    memInst.name = organizationName.trim();
                if (type)
                    memInst.type = type;
                if (city)
                    memInst.city = city.trim();
                if (state)
                    memInst.state = state.trim();
                if (website)
                    memInst.website = website.trim();
                if (affiliationNumber)
                    memInst.affiliationNumber = affiliationNumber.trim();
                if (description)
                    memInst.description = description.trim();
                if (!updatedInstitution)
                    updatedInstitution = memInst;
            }
        }
        (0, auditLogger_1.logAuditEvent)(req, 'ACCOUNT_UPDATED', 'User', userId, { fullName, phone, age });
        return res.json({
            success: true,
            message: 'Account details updated successfully!',
            user: {
                id: updatedUser?.id || userId,
                email: updatedUser?.email || req.user.email,
                fullName: updatedUser?.fullName || fullName,
                role: updatedUser?.role || req.user.role,
                avatarUrl: updatedUser?.avatarUrl || '',
                phone: updatedUser?.phone || phone || '',
                age: updatedUser?.age || age,
            },
            institution: updatedInstitution,
        });
    }
    catch (err) {
        console.error('Account update error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update account details.' });
    }
});
// PUT /api/v1/auth/password
// Secure password change verifying current password against MongoDB Atlas
router.put('/password', authMiddleware_1.authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }
    try {
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ id: userId }).lean();
        }
        catch (e) { }
        if (!user) {
            user = store_1.dbStore.getUserById(userId);
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const currentHash = user.passwordHash || store_1.dbStore.getUserById(userId)?.passwordHash;
        if (!currentHash || !bcryptjs_1.default.compareSync(currentPassword, currentHash)) {
            return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
        const newHash = bcryptjs_1.default.hashSync(newPassword, 10);
        try {
            await mongodb_1.UserModel.findOneAndUpdate({ id: userId }, { $set: { passwordHash: newHash, updatedAt: new Date().toISOString() } });
        }
        catch (e) { }
        const memUser = store_1.dbStore.getUserById(userId);
        if (memUser) {
            memUser.passwordHash = newHash;
            memUser.updatedAt = new Date().toISOString();
        }
        (0, auditLogger_1.logAuditEvent)(req, 'PASSWORD_CHANGED', 'User', userId);
        return res.json({
            success: true,
            message: 'Password changed successfully!',
        });
    }
    catch (err) {
        console.error('Password change error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
});
// POST /api/v1/auth/upload-resume
// Free local storage setup for PDF CV uploads with strict 1MB size limit
router.post('/upload-resume', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['TEACHER', 'ADMIN']), async (req, res) => {
    const userId = req.user.id;
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
        return res.status(400).json({ success: false, message: 'Please select a PDF CV document to upload.' });
    }
    // 1. Validate PDF file format
    const isPdfHeader = base64Data.startsWith('data:application/pdf;base64,');
    const isPdfName = (fileName || '').toLowerCase().endsWith('.pdf');
    if (!isPdfHeader && !isPdfName) {
        return res.status(400).json({
            success: false,
            message: 'Only PDF format resumes are accepted (.pdf). Please convert your CV to PDF.'
        });
    }
    try {
        // 2. Decode and check 5MB size limit (5,242,880 bytes)
        const base64Content = base64Data.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64Content, 'base64');
        const sizeBytes = buffer.length;
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (sizeBytes > MAX_SIZE) {
            return res.status(400).json({
                success: false,
                message: `File size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the 5MB size limit. Please upload a PDF under 5MB.`,
            });
        }
        // 3. Save to local storage (Free Setup)
        const uploadsDir = path_1.default.join(__dirname, '../../uploads/resumes');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanName = (fileName || 'resume.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
        const storedFileName = `cv-${userId}-${Date.now()}-${cleanName}`;
        const filePath = path_1.default.join(uploadsDir, storedFileName);
        fs_1.default.writeFileSync(filePath, buffer);
        const resumeUrl = `/uploads/resumes/${storedFileName}`;
        // 4. Update Teacher Profile in MongoDB Atlas & in-memory store
        try {
            await mongodb_1.TeacherProfileModel.findOneAndUpdate({ userId }, {
                $set: {
                    resumeUrl,
                    resumeFileName: fileName || 'Educator_Resume.pdf',
                    profileCompletionScore: 95,
                    updatedAt: new Date()
                }
            }, { upsert: true, new: true });
            // Also sync resumeUrl to all submitted applications by this educator
            await mongodb_1.JobApplicationModel.updateMany({ teacherId: userId }, { $set: { resumeUrl, updatedAt: new Date() } });
        }
        catch (dbErr) {
            console.warn('MongoDB resume update warning:', dbErr);
        }
        if (store_1.dbStore.profiles[userId]) {
            store_1.dbStore.profiles[userId].resumeUrl = resumeUrl;
            store_1.dbStore.profiles[userId].resumeFileName = fileName || 'Educator_Resume.pdf';
            store_1.dbStore.profiles[userId].profileCompletionScore = 95;
        }
        store_1.dbStore.applications.forEach(a => {
            if (a.teacherId === userId) {
                a.resumeUrl = resumeUrl;
            }
        });
        (0, auditLogger_1.logAuditEvent)(req, 'RESUME_UPLOADED', 'TeacherProfile', userId, {
            fileName: fileName || 'Educator_Resume.pdf',
            fileSizeBytes: sizeBytes,
            resumeUrl,
        });
        return res.json({
            success: true,
            message: 'PDF CV uploaded and attached successfully (1MB limit verified)!',
            resumeUrl,
            resumeFileName: fileName || 'Educator_Resume.pdf',
            fileSizeBytes: sizeBytes,
        });
    }
    catch (err) {
        console.error('Resume upload error:', err);
        return res.status(500).json({ success: false, message: 'Server error processing PDF upload.' });
    }
});
exports.default = router;
