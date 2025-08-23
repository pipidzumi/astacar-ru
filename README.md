# Astacar - C2C Car Auction Platform

A production-ready MVP for a C2C used car auction platform in Russia. The system supports identity verification, expert inspections, time-bound bidding with anti-sniping, refundable deposits, escrow-like deal flow, and dispute resolution.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth with JWT
- **Real-time**: Supabase Realtime for live auction updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase CLI
- Docker (for local development)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd astacar
   npm install
   ```

2. **Start Supabase locally**
   ```bash
   supabase start
   ```

3. **Run database migrations**
   ```bash
   supabase db reset
   ```

4. **Seed demo data**
   ```bash
   curl -X POST http://127.0.0.1:54321/functions/v1/seed-data
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the application.

## 👥 User Roles & Demo Accounts

The system supports six user roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@astacar.ru | Admin123! | Platform administration |
| **Moderator** | moderator@astacar.ru | Mod123! | Content moderation & disputes |
| **Expert** | expert1@astacar.ru | Expert123! | Vehicle inspections |
| **Seller** | seller1@astacar.ru | Seller123! | Create listings |
| **Buyer** | buyer1@astacar.ru | Buyer123! | Place bids |
| **Guest** | - | - | Browse listings (no auth) |

## 🔧 API Endpoints

### Authentication (`/functions/v1/auth`)

```bash
# Register new user
POST /functions/v1/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "buyer|seller",
  "full_name": "Full Name"
}

# Login
POST /functions/v1/auth/login
{
  "email": "user@example.com", 
  "password": "Password123!"
}
```

### Listings (`/functions/v1/listings`)

```bash
# Get all listings with filters
GET /functions/v1/listings?status=live&make=BMW&no_reserve=true&page=1&limit=20

# Create new listing (sellers only)
POST /functions/v1/listings
Authorization: Bearer <jwt_token>
{
  "vehicle": {
    "vin": "WBAJB1C55KWC12345",
    "make": "BMW",
    "model": "M3 Competition", 
    "year": 2022,
    "mileage": 15000,
    "engine": "3.0L Twin-Turbo I6",
    "transmission": "Автомат",
    "color": "Альпийский белый"
  },
  "start_price": 3800000,
  "reserve_price": 4200000,
  "buy_now_price": 5000000
}
```

### Bidding (`/functions/v1/bidding`)

```bash
# Create deposit for listing
POST /functions/v1/bidding/deposits  
Authorization: Bearer <jwt_token>
{
  "listing_id": "uuid",
  "amount": 15000
}

# Place bid
POST /functions/v1/bidding/bids
Authorization: Bearer <jwt_token>
{
  "listing_id": "uuid",
  "amount": 4250000
}

# Get bid history
GET /functions/v1/bidding/bids/{listing_id}
```

### Auction Engine (`/functions/v1/auction-engine`)

```bash
# Check auction state
POST /functions/v1/auction-engine/tick/{listing_id}

# Close ended auctions (cron job)
POST /functions/v1/auction-engine/sweep
```

## 🏦 Business Rules

### Bidding Rules
- **Minimum increment**: 5,000₽ (configurable)
- **Bid multiples**: All bids must be multiples of 5,000₽
- **KYC required**: Users must pass identity verification to bid/sell
- **Deposits**: 15,000₽ refundable deposit required per listing

### Anti-Sniping
- **Extension trigger**: Bids placed <30 minutes before end
- **Extension time**: +30 minutes from bid time
- **Multiple extensions**: Possible if bids continue

### Auction Lifecycle
1. **Draft** → **Moderation** → **Live** → **Finished**
2. **Reserve prices**: Optional, hidden from bidders
3. **Buy Now**: Optional instant purchase price
4. **Winner determination**: Highest bid ≥ reserve (if set)

### Financial Flow
1. **Deposits**: Held during auction, released to non-winners
2. **Winner**: Deposit captured as platform fee
3. **Escrow**: Vehicle payment held until handover confirmed
4. **Fees**: Configurable buyer/seller commissions

## 🗄️ Database Schema

### Core Tables

```sql
-- User management
users(id, email, role, kyc_status)
profiles(user_id, full_name, rating)

-- Auction domain  
vehicles(id, vin, make, model, year, mileage)
listings(id, vehicle_id, seller_id, status, prices, timing)
inspections(id, listing_id, expert_id, checklist, summary)

-- Bidding & transactions
bids(id, listing_id, bidder_id, amount, placed_at)
deposits(id, user_id, listing_id, amount, status)
transactions(id, listing_id, buyer_id, seller_id, amounts)

-- Operations
disputes(id, listing_id, reason, status, resolution)
notifications(id, user_id, type, channel, payload)
audit_logs(id, entity_type, action, user_id, diff)
```

### Security (RLS Policies)
- **Public read**: Listings, vehicles, inspections, bids
- **User isolation**: Deposits, transactions, notifications  
- **Role-based**: Admin/moderator elevated access
- **Audit trail**: All sensitive operations logged

## ⚙️ Configuration

Platform settings are stored in the `settings` table:

```json
{
  "MIN_BID_STEP": 5000,
  "SNIPE_EXTENSION_MIN": 30,
  "DEPOSIT_POLICY": "fixed",
  "DEPOSIT_FIXED": 15000,
  "COMMISSION_BUYER_FIXED": 15000,
  "COMMISSION_SELLER_PCT": 2,
  "DISPUTE_WINDOW_HOURS": 48
}
```

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **JWT authentication** with role-based access
- **Input validation** and SQL injection protection
- **Rate limiting** on critical endpoints
- **PII masking** in API responses
- **Audit logging** for all sensitive operations

## 📊 Real-time Features

- **Live bid updates** via Supabase Realtime
- **Auction timers** with automatic updates
- **Anti-sniping notifications**
- **Auction end notifications**

## 🧪 Testing

### Demo Data
The system includes comprehensive seed data:
- 8 demo users across all roles
- 3 active vehicle listings
- Realistic bid histories with anti-sniping scenarios
- Sample inspections and Q&A threads

### Testing Flows
1. **Registration** → **KYC** → **Deposit** → **Bidding**
2. **Seller listing creation** → **Expert inspection** → **Moderation** → **Live auction**
3. **Anti-sniping scenarios** with time extensions
4. **Auction closure** → **Winner determination** → **Escrow flow**

## 🚀 Deployment

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Production Checklist
- [ ] Configure OTP expiry settings in Supabase dashboard
- [ ] Set up custom domain and SSL
- [ ] Configure email templates
- [ ] Set up monitoring and alerts
- [ ] Review and adjust RLS policies
- [ ] Configure backup and disaster recovery

## 📈 Monitoring & Analytics

### Key Metrics
- **Sell-through rate**: % of listings that sell
- **Average bids per listing**: Engagement metric
- **Time to first bid**: Listing quality indicator  
- **Winner cancellation rate**: Process quality
- **Revenue per listing (ARPL)**: Platform performance

### Health Endpoints
- `/healthz` - Basic health check
- `/readyz` - Dependencies ready check

## 🤝 Contributing

1. Follow the domain-driven design patterns
2. Maintain comprehensive audit logging
3. Write tests for critical business logic
4. Update API documentation for changes
5. Ensure RLS policies for new tables

## 📄 License

This is a production-ready MVP for demonstration purposes.

---

**Astacar** - Transparent, secure, and efficient car auctions for Russia 🚗🇷🇺

## Project info

**URL**: https://lovable.dev/projects/1069b434-d7ce-42c9-94bf-811a72e3c989

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1069b434-d7ce-42c9-94bf-811a72e3c989) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1069b434-d7ce-42c9-94bf-811a72e3c989) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
