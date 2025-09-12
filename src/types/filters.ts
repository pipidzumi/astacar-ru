// Comprehensive filter types for C2C auction platform

// Vehicle basic filter types
export type VehicleMake = string;
export type VehicleModel = string;  
export type VehicleGeneration = string;

export type BodyType = 'sedan' | 'hatchback' | 'wagon' | 'coupe' | 'cabrio' | 'liftback' | 'pickup' | 'minivan' | 'suv';
export type TransmissionType = 'mt' | 'at' | 'cvt' | 'amt' | 'dct';
export type DriveType = 'fwd' | 'rwd' | 'awd' | '4wd';
export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'gas';
export type SteeringWheel = 'left' | 'right';

// Auction state types
export type AuctionState = 'live' | 'scheduled' | 'finished';
export type TimeFilter = '15m' | '1h' | '24h' | '3d';
export type ReserveOption = 'no-reserve' | 'reserve-met' | 'reserve-not-met';

// Seller and source types
export type SellerType = 'private' | 'corporate' | 'fleet' | 'dealer';
export type AdSource = 'auto.ru' | 'avito' | 'drom' | 'astacar';

// Condition and history types
export type AccidentStatus = 'no-accidents' | 'minor-accidents' | 'major-accidents';
export type TitleType = 'original' | 'duplicate' | 'electronic';

// Location types
export interface LocationOption {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface RegionOption extends LocationOption {
  country: string;
}

export interface CityOption extends LocationOption {
  regionId: string;
}

// Dependent select options
export interface VehicleOptions {
  makes: VehicleMake[];
  modelsByMake: Record<VehicleMake, VehicleModel[]>;
  generationsByModel: Record<string, VehicleGeneration[]>; // Key: "make|model"
}

// Range filter types
export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface YearRange {
  min: number | null;
  max: number | null;
}

export interface MileageRange {
  min: number | null;
  max: number | null;
}

export interface EngineRange {
  displacement: { min: number | null; max: number | null }; // L
  power: { min: number | null; max: number | null }; // HP
}

// Comprehensive filter state interface
export interface FilterState {
  // Vehicle basics
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  
  // Year and price ranges
  yearFrom: number | null;
  yearTo: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  
  // Physical characteristics
  mileageFrom: number | null;
  mileageTo: number | null;
  bodyTypes: BodyType[];
  transmissions: TransmissionType[];
  driveTypes: DriveType[];
  fuelTypes: FuelType[];
  
  // Engine specifications
  displacementFrom: number | null; // L
  displacementTo: number | null;
  powerFrom: number | null; // HP
  powerTo: number | null;
  
  // Vehicle details
  colors: string[];
  steeringWheel: SteeringWheel | null;
  
  // Condition and history
  ownersCount: number[];
  accidentStatus: AccidentStatus[];
  originalTitle: boolean;
  vinPresent: boolean;
  vinVerified: boolean;
  serviceHistory: boolean;
  excludeCommercial: boolean;
  
  // Seller and source
  sellerTypes: SellerType[];
  adSources: AdSource[];
  
  // Auction facets
  auctionStates: AuctionState[];
  endsWithin: TimeFilter | null;
  endDateFrom: Date | null;
  endDateTo: Date | null;
  reserveOptions: ReserveOption[];
  buyNowAvailable: boolean;
  currentBidFrom: number | null;
  currentBidTo: number | null;
  withInspection: boolean;
  withQA: boolean;
  
  // Access and trust
  kycVerifiedSeller: boolean;
  kycVerifiedBuyer: boolean;
  requiresDeposit: boolean;
  
  // Location and delivery
  regions: string[];
  cities: string[];
  selectedCityId: string | null;
  radius: number; // km
  pickupRequired: boolean;
  deliveryAvailable: boolean;
  
  // Listing media/quality
  withVideo: boolean;
  minPhotos: number;
  mediaQualityScore: number;
  
  // Sorting and pagination
  sort: string;
  page: number;
  limit: number;
  
  // UI state
  isApplying: boolean;
  resultsCount: number;
  
  // Saved searches
  savedSearchName: string;
  availableSavedSearches: SavedSearch[];
}

// Filter actions
export type FilterAction = 
  | { type: "SET_FIELD"; field: keyof FilterState; value: any }
  | { type: "TOGGLE_ARRAY_ITEM"; field: keyof FilterState; value: string | number }
  | { type: "SET_RANGE"; field: string; range: { from: number | null; to: number | null } }
  | { type: "SET_LOCATION"; cityId: string | null; radius?: number }
  | { type: "ADD_MODEL"; make: string; models: string[] }
  | { type: "REMOVE_MODEL"; make: string; model: string }
  | { type: "RESET_FILTERS" }
  | { type: "LOAD_FROM_URL"; filters: Partial<FilterState> }
  | { type: "LOAD_SAVED_SEARCH"; search: SavedSearch }
  | { type: "SET_APPLYING"; applying: boolean }
  | { type: "SET_RESULTS_COUNT"; count: number };

// Saved search interface
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: Partial<FilterState>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Filter chip for active filters display
export interface FilterChip {
  key: string;
  label: string;
  category: string;
  onRemove: () => void;
}

// API request types
export interface FilterOptionsRequest {
  make?: string;
  model?: string;
}

export interface FilterOptionsResponse {
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  regions: RegionOption[];
  cities: CityOption[];
}

export interface ListingsRequest {
  filters: Partial<FilterState>;
  page?: number;
  limit?: number;
}

export interface ListingsResponse {
  items: any[]; // Replace with actual listing type
  total: number;
  page: number;
  limit: number;
  facetCounts?: FacetCounts;
}

// Facet counts for showing result counts per filter option
export interface FacetCounts {
  makes: Record<string, number>;
  bodyTypes: Record<string, number>;
  transmissions: Record<string, number>;
  fuelTypes: Record<string, number>;
  auctionStates: Record<string, number>;
  priceRanges: Record<string, number>;
  yearRanges: Record<string, number>;
}

// URL sync types
export interface URLFilterParams {
  makes?: string;
  models?: string;
  generations?: string;
  price_from?: string;
  price_to?: string;
  year_from?: string;
  year_to?: string;
  mileage_from?: string;
  mileage_to?: string;
  body_types?: string;
  transmissions?: string;
  drive_types?: string;
  fuel_types?: string;
  displacement_from?: string;
  displacement_to?: string;
  power_from?: string;
  power_to?: string;
  colors?: string;
  steering_wheel?: string;
  owners_count?: string;
  accident_status?: string;
  original_title?: string;
  vin_present?: string;
  vin_verified?: string;
  service_history?: string;
  seller_types?: string;
  ad_sources?: string;
  auction_states?: string;
  ends_within?: string;
  end_date_from?: string;
  end_date_to?: string;
  reserve_options?: string;
  buy_now_available?: string;
  current_bid_from?: string;
  current_bid_to?: string;
  with_inspection?: string;
  with_qa?: string;
  kyc_verified_seller?: string;
  kyc_verified_buyer?: string;
  requires_deposit?: string;
  regions?: string;
  cities?: string;
  city_id?: string;
  radius?: string;
  pickup_required?: string;
  delivery_available?: string;
  with_video?: string;
  min_photos?: string;
  media_quality_score?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// Form validation schemas (to be used with zod)
export interface FilterFormData {
  vehicleBasics: {
    makes: string[];
    models: string[];
    generations: string[];
    yearRange: YearRange;
    priceRange: PriceRange;
  };
  specifications: {
    mileageRange: MileageRange;
    bodyTypes: BodyType[];
    transmissions: TransmissionType[];
    driveTypes: DriveType[];
    fuelTypes: FuelType[];
    engineRange: EngineRange;
    colors: string[];
    steeringWheel: SteeringWheel | null;
  };
  condition: {
    ownersCount: number[];
    accidentStatus: AccidentStatus[];
    originalTitle: boolean;
    vinPresent: boolean;
    vinVerified: boolean;
    serviceHistory: boolean;
  };
  auction: {
    auctionStates: AuctionState[];
    endsWithin: TimeFilter | null;
    reserveOptions: ReserveOption[];
    buyNowAvailable: boolean;
    currentBidRange: PriceRange;
    withInspection: boolean;
    withQA: boolean;
  };
  location: {
    regions: string[];
    cities: string[];
    selectedCityId: string | null;
    radius: number;
    pickupRequired: boolean;
    deliveryAvailable: boolean;
  };
  media: {
    withVideo: boolean;
    minPhotos: number;
    mediaQualityScore: number;
  };
}