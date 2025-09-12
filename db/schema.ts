import { pgTable, text, uuid, timestamp, integer, bigint, boolean, jsonb, numeric, inet, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['guest', 'buyer', 'seller', 'expert', 'moderator', 'admin']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'success', 'failed', 'not_required']);
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'moderation', 'live', 'finished', 'cancelled']);
export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video', 'doc']);
export const bidSourceEnum = pgEnum('bid_source', ['manual', 'autobid']);
export const depositStatusEnum = pgEnum('deposit_status', ['hold', 'released', 'captured', 'failed']);
export const transactionStatusEnum = pgEnum('transaction_status', ['initiated', 'escrow', 'paid', 'released', 'refund', 'failed']);
export const disputeReasonEnum = pgEnum('dispute_reason', ['condition_mismatch', 'undisclosed_lien', 'doc_issue', 'other']);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'in_review', 'resolved', 'rejected']);
export const notificationChannelEnum = pgEnum('notification_channel', ['email', 'sms', 'push', 'webhook']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

// Users table (extends auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  phone: text('phone').unique(),
  role: userRoleEnum('role').notNull().default('buyer'),
  kycStatus: kycStatusEnum('kyc_status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Profiles table
export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  dob: timestamp('dob', { mode: 'date' }),
  idDocMasked: text('id_doc_masked'),
  address: text('address'),
  cityId: uuid('city_id').references(() => cities.id),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0.0'),
  kycVerified: boolean('kyc_verified').default(false),
  banFlags: jsonb('ban_flags').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Additional enums for vehicles
export const bodyTypeEnum = pgEnum('body_type', ['sedan', 'hatchback', 'wagon', 'coupe', 'cabrio', 'liftback', 'pickup', 'minivan', 'suv']);
export const transmissionEnum = pgEnum('transmission_type', ['mt', 'at', 'cvt', 'amt', 'dct']);
export const driveTypeEnum = pgEnum('drive_type', ['fwd', 'rwd', 'awd', '4wd']);
export const fuelTypeEnum = pgEnum('fuel_type', ['gasoline', 'diesel', 'hybrid', 'electric', 'gas']);
export const steeringWheelEnum = pgEnum('steering_wheel', ['left', 'right']);
export const sellerTypeEnum = pgEnum('seller_type', ['private', 'corporate', 'fleet', 'dealer']);

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  vin: text('vin').unique(),
  vinVerified: boolean('vin_verified').default(false),
  make: text('make').notNull(),
  model: text('model').notNull(),
  generation: text('generation'),
  year: integer('year').notNull(),
  bodyType: bodyTypeEnum('body_type'),
  mileage: integer('mileage').notNull(),
  engine: text('engine'),
  displacement: numeric('displacement', { precision: 3, scale: 1 }), // L
  power: integer('power'), // HP
  transmission: transmissionEnum('transmission'),
  drivetrain: driveTypeEnum('drivetrain'),
  fuelType: fuelTypeEnum('fuel_type'),
  color: text('color'),
  steeringWheel: steeringWheelEnum('steering_wheel').default('left'),
  ownersCount: integer('owners_count'),
  accidentHistory: boolean('accident_history').default(false),
  originalTitle: boolean('original_title').default(false),
  serviceHistory: boolean('service_history').default(false),
  docsStatus: jsonb('docs_status').default({}),
  features: jsonb('features').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Geographic tables for location-based filtering
export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  country: text('country').default('RU'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  regionId: uuid('region_id').notNull().references(() => regions.id, { onDelete: 'restrict' }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Listings table
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'restrict' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  sellerType: sellerTypeEnum('seller_type').default('private'),
  status: listingStatusEnum('status').notNull().default('draft'),
  startPrice: bigint('start_price', { mode: 'number' }).notNull(),
  reservePrice: bigint('reserve_price', { mode: 'number' }),
  buyNowPrice: bigint('buy_now_price', { mode: 'number' }),
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),
  currentPrice: bigint('current_price', { mode: 'number' }).notNull().default(0),
  currentBids: integer('current_bids').default(0),
  reserveMet: boolean('reserve_met').default(false),
  hasVideo: boolean('has_video').default(false),
  photosCount: integer('photos_count').default(0),
  hasInspection: boolean('has_inspection').default(false),
  hasQA: boolean('has_qa').default(false),
  requiresDeposit: boolean('requires_deposit').default(false),
  pickupRequired: boolean('pickup_required').default(false),
  deliveryAvailable: boolean('delivery_available').default(false),
  cityId: uuid('city_id').references(() => cities.id),
  winnerId: uuid('winner_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Inspections table
export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').unique().notNull().references(() => listings.id, { onDelete: 'restrict' }),
  expertId: uuid('expert_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  inspectedAt: timestamp('inspected_at', { withTimezone: true }),
  checklist: jsonb('checklist').default({}),
  legal: jsonb('legal').default({}),
  media: jsonb('media').default({}),
  expertSummary: text('expert_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Media assets table
export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Bids table
export const bids = pgTable('bids', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'restrict' }),
  bidderId: uuid('bidder_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  placedAt: timestamp('placed_at', { withTimezone: true }).notNull().defaultNow(),
  valid: boolean('valid').notNull().default(true),
  source: bidSourceEnum('source').notNull().default('manual'),
  ip: text('ip'),
  device: jsonb('device').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Deposits table
export const deposits = pgTable('deposits', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'restrict' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: depositStatusEnum('status').notNull().default('hold'),
  providerRef: text('provider_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'restrict' }),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  vehicleAmount: bigint('vehicle_amount', { mode: 'number' }).notNull(),
  feeAmount: bigint('fee_amount', { mode: 'number' }).notNull(),
  status: transactionStatusEnum('status').notNull().default('initiated'),
  escrowRef: text('escrow_ref'),
  documents: jsonb('documents').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Disputes table
export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'restrict' }),
  initiatorId: uuid('initiator_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  reasonType: disputeReasonEnum('reason_type').notNull(),
  description: text('description').notNull(),
  evidence: jsonb('evidence').default([]),
  status: disputeStatusEnum('status').notNull().default('open'),
  resolution: jsonb('resolution').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Q&A table
export const qaThreads = pgTable('qa_threads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer'),
  questionerId: uuid('questioner_id').references(() => users.id),
  answererId: uuid('answerer_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  payload: jsonb('payload').default({}),
  status: notificationStatusEnum('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Settings table
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  userId: uuid('user_id').references(() => users.id),
  diff: jsonb('diff').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Outbox table for domain events
export const outboxEvents = pgTable('outbox_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  aggregateId: uuid('aggregate_id').notNull(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Seller submissions table (from later migration)
export const sellerSubmissions = pgTable('seller_submissions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sellerId: uuid('seller_id').notNull(),
  status: text('status').notNull().default('draft'),
  
  // Stage 1: Short form data
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  
  // Vehicle basics
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  trim: text('trim'),
  mileage: integer('mileage'),
  city: text('city'),
  region: text('region'),
  vin: text('vin'),
  vinUnknownReason: text('vin_unknown_reason'),
  
  // Ownership
  sellerType: text('seller_type'),
  ownersCount: integer('owners_count'),
  
  // Title/legal
  titleType: text('title_type'),
  hasLiens: boolean('has_liens'),
  hasRestrictions: boolean('has_restrictions'),
  
  // Notes
  sellerNotes: text('seller_notes'),
  
  // Stage 2: Full intake data
  bodyStyle: text('body_style'),
  exteriorColor: text('exterior_color'),
  interiorColor: text('interior_color'),
  drivetrain: text('drivetrain'),
  engine: text('engine'),
  transmission: text('transmission'),
  importStatus: boolean('import_status').default(false),
  
  // Documentation
  serviceRecords: jsonb('service_records').default([]),
  lastMajorServices: jsonb('last_major_services').default({}),
  
  // Condition
  usageType: text('usage_type'),
  winterStorage: boolean('winter_storage'),
  accidentHistory: boolean('accident_history'),
  accidentDetails: text('accident_details'),
  knownIssues: text('known_issues'),
  warningLights: boolean('warning_lights'),
  modifications: jsonb('modifications').default([]),
  keysCount: integer('keys_count'),
  manualsAvailable: boolean('manuals_available'),
  
  // Pricing
  startPrice: bigint('start_price', { mode: 'number' }),
  reservePrice: bigint('reserve_price', { mode: 'number' }),
  hasReserve: boolean('has_reserve').default(false),
  buyNowPrice: bigint('buy_now_price', { mode: 'number' }),
  marketEstimate: bigint('market_estimate', { mode: 'number' }),
  
  // Scheduling
  earliestPublishDate: timestamp('earliest_publish_date', { mode: 'date' }),
  preferredPublishTime: text('preferred_publish_time'),
  
  // Public description
  publicDescription: text('public_description'),
  highlights: text('highlights'),
  maintenanceHistory: text('maintenance_history'),
  flaws: text('flaws'),
  saleReason: text('sale_reason'),
  includedExtras: text('included_extras'),
  
  // Media tracking
  photosCount: integer('photos_count').default(0),
  videosCount: integer('videos_count').default(0),
  requiredPhotosChecklist: jsonb('required_photos_checklist').default({}),
  mediaQualityScore: integer('media_quality_score').default(0),
  
  // Moderation
  moderationFeedback: jsonb('moderation_feedback').default([]),
  moderatorId: uuid('moderator_id'),
  moderationCompletedAt: timestamp('moderation_completed_at', { withTimezone: true }),
  
  // Pre-decision
  predecisionResult: text('predecision_result'),
  predecisionReason: text('predecision_reason'),
  predecisionRequirements: jsonb('predecision_requirements').default([]),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  submittedForModerationAt: timestamp('submitted_for_moderation_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true })
});

// Submission media assets table
export const submissionMedia = pgTable('submission_media', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  submissionId: uuid('submission_id').notNull().references(() => sellerSubmissions.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category'),
  orderIndex: integer('order_index').notNull().default(0),
  fileSize: integer('file_size'),
  resolution: text('resolution'),
  qualityScore: integer('quality_score').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Saved searches table for user filter presets
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  filters: jsonb('filters').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Vehicle make-model-generation lookup table for dependent selects
export const vehicleOptions = pgTable('vehicle_options', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  make: text('make').notNull(),
  model: text('model').notNull(),
  generation: text('generation'),
  startYear: integer('start_year'),
  endYear: integer('end_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});