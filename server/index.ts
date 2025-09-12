import express from 'express';
import cors from 'cors';
import { db } from './db';
import { users, profiles, vehicles, listings, bids, deposits, transactions, qaThreads, auditLogs, notifications, settings } from '../db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    await db.select({ count: sql`count(*)` }).from(users);
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, phone, role = 'buyer', fullName } = req.body;
    
    // Create user
    const [user] = await db.insert(users).values({
      id: sql`gen_random_uuid()`,
      email,
      phone,
      role: role as any,
      kycStatus: 'pending'
    }).returning();

    // Create profile if fullName provided
    if (fullName) {
      await db.insert(profiles).values({
        userId: user.id,
        fullName
      });
    }

    res.json({ user, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Listings routes
app.get('/api/listings', async (req, res) => {
  try {
    const { status, make, no_reserve, page = '1', limit = '20' } = req.query;
    
    let query = db
      .select({
        listing: listings,
        vehicle: vehicles,
        seller: users,
        sellerProfile: profiles
      })
      .from(listings)
      .leftJoin(vehicles, eq(listings.vehicleId, vehicles.id))
      .leftJoin(users, eq(listings.sellerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId));

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(listings.status, status as any));
    }
    if (make) {
      conditions.push(eq(vehicles.make, make as string));
    }
    if (no_reserve === 'true') {
      conditions.push(sql`${listings.reservePrice} IS NULL`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const data = await query.limit(limitNum).offset(offset);

    res.json({ data });
  } catch (error) {
    console.error('Listings query error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { vehicle, start_price, reserve_price, buy_now_price, seller_id } = req.body;

    // Create vehicle first
    const [newVehicle] = await db.insert(vehicles).values({
      ...vehicle,
      id: sql`gen_random_uuid()`
    }).returning();

    // Create listing
    const [listing] = await db.insert(listings).values({
      id: sql`gen_random_uuid()`,
      vehicleId: newVehicle.id,
      sellerId: seller_id,
      startPrice: start_price,
      reservePrice: reserve_price,
      buyNowPrice: buy_now_price,
      currentPrice: start_price
    }).returning();

    // Create audit log
    await db.insert(auditLogs).values({
      id: sql`gen_random_uuid()`,
      entityType: 'listing',
      entityId: listing.id,
      action: 'created',
      userId: seller_id,
      diff: { created: listing }
    });

    res.status(201).json({ data: listing });
  } catch (error) {
    console.error('Listing creation error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Bidding routes
app.post('/api/bidding/deposits', async (req, res) => {
  try {
    const { listing_id, amount = 15000, user_id } = req.body;

    const [deposit] = await db.insert(deposits).values({
      id: sql`gen_random_uuid()`,
      userId: user_id,
      listingId: listing_id,
      amount,
      status: 'hold',
      providerRef: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }).returning();

    res.status(201).json({ data: deposit });
  } catch (error) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ error: 'Failed to create deposit' });
  }
});

app.post('/api/bidding/bids', async (req, res) => {
  try {
    const { listing_id, amount, user_id, ip } = req.body;

    // Validate deposit exists
    const deposit = await db.select().from(deposits)
      .where(and(
        eq(deposits.userId, user_id),
        eq(deposits.listingId, listing_id),
        eq(deposits.status, 'hold')
      ))
      .limit(1);

    if (!deposit.length) {
      return res.status(403).json({ error: 'Active deposit required to place bids' });
    }

    // Get listing details
    const [listing] = await db.select().from(listings)
      .where(eq(listings.id, listing_id));

    if (!listing || listing.status !== 'live') {
      return res.status(400).json({ error: 'Listing not available for bidding' });
    }

    // Validate bid amount
    if (amount <= listing.currentPrice) {
      return res.status(400).json({ 
        error: `Bid must be higher than current price of ₽${listing.currentPrice.toLocaleString()}` 
      });
    }

    // Create bid
    const [bid] = await db.insert(bids).values({
      id: sql`gen_random_uuid()`,
      listingId: listing_id,
      bidderId: user_id,
      amount,
      ip,
      valid: true,
      source: 'manual'
    }).returning();

    // Update listing current price
    await db.update(listings)
      .set({ currentPrice: amount })
      .where(eq(listings.id, listing_id));

    res.status(201).json({ data: bid });
  } catch (error) {
    console.error('Bid placement error:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

// Q&A routes
app.post('/api/qa/questions', async (req, res) => {
  try {
    const { listing_id, question, user_id } = req.body;

    const [qaThread] = await db.insert(qaThreads).values({
      id: sql`gen_random_uuid()`,
      listingId: listing_id,
      question,
      questionerId: user_id
    }).returning();

    res.status(201).json({ data: qaThread });
  } catch (error) {
    console.error('Question creation error:', error);
    res.status(500).json({ error: 'Failed to submit question' });
  }
});

app.put('/api/qa/questions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, user_id } = req.body;

    const [updatedThread] = await db.update(qaThreads)
      .set({ 
        answer,
        answererId: user_id,
        updatedAt: sql`NOW()`
      })
      .where(eq(qaThreads.id, id))
      .returning();

    res.json({ data: updatedThread });
  } catch (error) {
    console.error('Answer update error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const data = await db.select().from(settings);
    res.json({ data });
  } catch (error) {
    console.error('Settings query error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Seed data route (for testing)
app.post('/api/seed-data', async (req, res) => {
  try {
    // Insert default settings
    const defaultSettings = [
      { key: 'MIN_BID_STEP', value: '5000' },
      { key: 'SNIPE_EXTENSION_MIN', value: '30' },
      { key: 'DEPOSIT_POLICY', value: '"fixed"' },
      { key: 'DEPOSIT_FIXED', value: '15000' },
      { key: 'DEPOSIT_PCT', value: '5' },
      { key: 'COMMISSION_BUYER_FIXED', value: '15000' },
      { key: 'COMMISSION_BUYER_PCT', value: '0' },
      { key: 'COMMISSION_SELLER_PCT', value: '2' },
      { key: 'RESERVE_ALLOWED', value: 'true' },
      { key: 'BUY_NOW_ALLOWED', value: 'true' },
      { key: 'DISPUTE_WINDOW_HOURS', value: '48' },
      { key: 'ESCROW_PROVIDER', value: '"mock"' },
      { key: 'MEDIA_REQUIREMENTS', value: '{"photos_min": 60, "videos_min": 2}' }
    ];

    await db.insert(settings).values(defaultSettings);

    res.json({ message: 'Seed data created successfully' });
  } catch (error) {
    console.error('Seed data creation error:', error);
    res.status(500).json({ error: 'Failed to create seed data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});