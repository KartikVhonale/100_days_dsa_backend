import bcrypt from 'bcryptjs';
import { dbService } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { email, password, name, currentTrack = 'intermediate' } = req.body;

    // Email validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    // Password validation (security constraint: min 6 chars)
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters in length.'
      });
    }

    // Check duplicate account
    const existingUser = await dbService.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please sign in.'
      });
    }

    // Validate track
    const validTracks = ['all', 'beginner', 'intermediate', 'advanced', 'elite'];
    const track = validTracks.includes(currentTrack) ? currentTrack : 'intermediate';

    // Hash password with salt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique user identifier
    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const cleanName = (name && typeof name === 'string' && name.trim())
      ? name.trim()
      : cleanEmail.split('@')[0];

    const newUser = await dbService.createUser({
      userId,
      email: cleanEmail,
      passwordHash,
      name: cleanName,
      currentTrack: track
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    console.error('[AuthController] register error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed: ' + error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await dbService.findUserByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const sanitizedUser = await dbService.findUserById(user.userId);
    const token = generateToken(sanitizedUser);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: sanitizedUser,
        token
      }
    });
  } catch (error) {
    console.error('[AuthController] login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed: ' + error.message });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await dbService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const progress = await dbService.getProgress(userId);
    return res.status(200).json({
      success: true,
      data: {
        user,
        solvedCount: progress.length
      }
    });
  } catch (error) {
    console.error('[AuthController] getMe error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      name,
      currentTrack,
      dailyHoursTarget,
      targetDate,
      startDate,
      activeDays,
      excludedDates,
      timezone
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (currentTrack !== undefined) updates.currentTrack = currentTrack;
    if (dailyHoursTarget !== undefined) updates.dailyHoursTarget = Number(dailyHoursTarget);
    if (targetDate !== undefined) updates.targetDate = targetDate;
    if (startDate !== undefined) updates.startDate = startDate;
    if (activeDays !== undefined) updates.activeDays = activeDays;
    if (excludedDates !== undefined) updates.excludedDates = excludedDates;
    if (timezone !== undefined) updates.timezone = timezone;

    const updatedUser = await dbService.updateUser(userId, updates);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('[AuthController] updateProfile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
