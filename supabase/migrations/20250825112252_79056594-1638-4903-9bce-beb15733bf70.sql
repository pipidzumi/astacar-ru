-- Create seller submissions table
CREATE TABLE public.seller_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pre_decision', 'full_intake', 'moderation', 'approved', 'scheduled', 'live', 'rejected')),
  
  -- Stage 1: Short form data
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Vehicle basics
  make TEXT,
  model TEXT,
  year INTEGER,
  trim TEXT,
  mileage INTEGER,
  city TEXT,
  region TEXT,
  vin TEXT,
  vin_unknown_reason TEXT,
  
  -- Ownership
  seller_type TEXT CHECK (seller_type IN ('private', 'dealer')),
  owners_count INTEGER,
  
  -- Title/legal
  title_type TEXT CHECK (title_type IN ('pts', 'epts')),
  has_liens BOOLEAN,
  has_restrictions BOOLEAN,
  
  -- Notes
  seller_notes TEXT,
  
  -- Stage 2: Full intake data
  body_style TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  drivetrain TEXT,
  engine TEXT,
  transmission TEXT,
  import_status BOOLEAN DEFAULT false,
  
  -- Documentation
  service_records JSONB DEFAULT '[]'::jsonb,
  last_major_services JSONB DEFAULT '{}'::jsonb,
  
  -- Condition
  usage_type TEXT CHECK (usage_type IN ('city', 'highway', 'mixed')),
  winter_storage BOOLEAN,
  accident_history BOOLEAN,
  accident_details TEXT,
  known_issues TEXT,
  warning_lights BOOLEAN,
  modifications JSONB DEFAULT '[]'::jsonb,
  keys_count INTEGER,
  manuals_available BOOLEAN,
  
  -- Pricing
  start_price BIGINT,
  reserve_price BIGINT,
  has_reserve BOOLEAN DEFAULT false,
  buy_now_price BIGINT,
  market_estimate BIGINT,
  
  -- Scheduling
  earliest_publish_date DATE,
  preferred_publish_time TIME,
  
  -- Public description
  public_description TEXT,
  highlights TEXT,
  maintenance_history TEXT,
  flaws TEXT,
  sale_reason TEXT,
  included_extras TEXT,
  
  -- Media tracking
  photos_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  required_photos_checklist JSONB DEFAULT '{}'::jsonb,
  media_quality_score INTEGER DEFAULT 0,
  
  -- Moderation
  moderation_feedback JSONB DEFAULT '[]'::jsonb,
  moderator_id UUID,
  moderation_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Pre-decision
  predecision_result TEXT CHECK (predecision_result IN ('accepted', 'conditional', 'need_more_info', 'rejected')),
  predecision_reason TEXT,
  predecision_requirements JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_for_moderation_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.seller_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sellers can view their own submissions" 
  ON public.seller_submissions 
  FOR SELECT 
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create submissions" 
  ON public.seller_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own submissions" 
  ON public.seller_submissions 
  FOR UPDATE 
  USING (auth.uid() = seller_id);

CREATE POLICY "Moderators can view all submissions" 
  ON public.seller_submissions 
  FOR SELECT 
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators can update submissions" 
  ON public.seller_submissions 
  FOR UPDATE 
  USING (is_moderator_or_admin(auth.uid()));

-- Create submission media assets table
CREATE TABLE public.submission_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.seller_submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT, -- e.g., 'exterior_front', 'interior_dashboard', 'engine_bay'
  order_index INTEGER NOT NULL DEFAULT 0,
  file_size INTEGER,
  resolution TEXT, -- e.g., '1920x1080'
  quality_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for submission media
ALTER TABLE public.submission_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their submission media" 
  ON public.submission_media 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.seller_submissions 
    WHERE id = submission_media.submission_id 
    AND seller_id = auth.uid()
  ));

CREATE POLICY "Moderators can view all submission media" 
  ON public.submission_media 
  FOR SELECT 
  USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for timestamp updates
CREATE TRIGGER update_seller_submissions_updated_at
  BEFORE UPDATE ON public.seller_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_seller_submissions_seller_id ON public.seller_submissions(seller_id);
CREATE INDEX idx_seller_submissions_status ON public.seller_submissions(status);
CREATE INDEX idx_submission_media_submission_id ON public.submission_media(submission_id);