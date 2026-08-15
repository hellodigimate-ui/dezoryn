import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// In-memory subscriber store fallback
const subscribers = new Set<string>();

const handleSubscription = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  // 1. Check in-memory store
  if (subscribers.has(trimmed)) {
    return res.status(200).json({
      success: false,
      isSubscribed: true,
      message: 'This email address is already subscribed to our newsletter.',
    });
  }

  // 2. Persist in PostgreSQL
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`
    );

    const existing: any = await prisma.$queryRawUnsafe(
      'SELECT * FROM newsletter_subscribers WHERE LOWER(email) = $1 LIMIT 1',
      trimmed
    );

    if (existing && Array.isArray(existing) && existing.length > 0) {
      subscribers.add(trimmed);
      return res.status(200).json({
        success: false,
        isSubscribed: true,
        message: 'This email address is already subscribed to our newsletter.',
      });
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await prisma.$executeRawUnsafe(
      'INSERT INTO newsletter_subscribers (id, email) VALUES ($1, $2)',
      id,
      trimmed
    );
    subscribers.add(trimmed);

    console.log(`[Newsletter] New subscriber stored in DB: ${trimmed}`);

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed! Welcome to the Dezoryn community 🎉',
    });
  } catch (err: any) {
    if (err?.code === 'P2002' || err?.message?.includes('unique') || err?.message?.includes('duplicate')) {
      subscribers.add(trimmed);
      return res.status(200).json({
        success: false,
        isSubscribed: true,
        message: 'This email address is already subscribed to our newsletter.',
      });
    }
    // Fallback if DB is unavailable
    subscribers.add(trimmed);
    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed! Welcome to the Dezoryn community 🎉',
    });
  }
};

// Handle both POST /api/v1/newsletter/subscribe and POST /api/v1/newsletter
router.post('/subscribe', handleSubscription);
router.post('/', handleSubscription);

// GET /api/v1/newsletter/subscribers
router.get('/subscribers', async (_req: Request, res: Response) => {
  try {
    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM newsletter_subscribers ORDER BY "createdAt" DESC');
    return res.status(200).json({
      success: true,
      data: { count: rows.length, subscribers: rows },
    });
  } catch {
    return res.status(200).json({
      success: true,
      data: { count: subscribers.size, subscribers: Array.from(subscribers) },
    });
  }
});

export default router;
