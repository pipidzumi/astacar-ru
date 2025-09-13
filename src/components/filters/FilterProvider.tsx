import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  FilterState, 
  FilterAction, 
  SavedSearch, 
  VehicleOptions,
  FilterChip,
  URLFilterParams
} from "@/types/filters";

// Enhanced initial state with all C2C auction filter facets
const initialState: FilterState = {
  // Vehicle basics
  makes: [],
  models: [],
  generations: [],
  
  // Year and price ranges
  yearFrom: null,
  yearTo: null,
  priceFrom: null,
  priceTo: null,
  
  // Physical characteristics
  mileageFrom: null,
  mileageTo: null,
  bodyTypes: [],
  transmissions: [],
  driveTypes: [],
  fuelTypes: [],
  
  // Engine specifications
  displacementFrom: null,
  displacementTo: null,
  powerFrom: null,
  powerTo: null,
  
  // Vehicle details
  colors: [],
  steeringWheel: null,
  
  // Condition and history
  ownersCount: [],
  accidentStatus: [],
  originalTitle: false,
  vinPresent: false,
  vinVerified: false,
  serviceHistory: false,
  excludeCommercial: false,
  
  // Seller and source
  sellerTypes: [],
  adSources: [],
  
  // Auction facets
  auctionStates: ["live"], // Default to live auctions
  endsWithin: null,
  endDateFrom: null,
  endDateTo: null,
  reserveOptions: [],
  buyNowAvailable: false,
  currentBidFrom: null,
  currentBidTo: null,
  withInspection: false,
  withQA: false,
  
  // Access and trust
  kycVerifiedSeller: false,
  kycVerifiedBuyer: false,
  requiresDeposit: false,
  
  // Location and delivery
  regions: [],
  cities: [],
  selectedCityId: null,
  radius: 50, // Default 50km radius
  pickupRequired: false,
  deliveryAvailable: false,
  
  // Listing media/quality
  withVideo: false,
  minPhotos: 0,
  mediaQualityScore: 0,
  
  // Sorting and pagination
  sort: "relevance",
  page: 1,
  limit: 24,
  
  // UI state
  isApplying: false,
  resultsCount: 0,
  
  // Saved searches
  savedSearchName: "",
  availableSavedSearches: [],
};

// Enhanced reducer with all filter actions
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "TOGGLE_ARRAY_ITEM": {
      const currentArray = state[action.field] as (string | number)[];
      const exists = currentArray.includes(action.value);
      return {
        ...state,
        [action.field]: exists
          ? currentArray.filter(item => item !== action.value)
          : [...currentArray, action.value],
      };
    }

    case "SET_RANGE":
      return {
        ...state,
        [`${action.field}From`]: action.range.from,
        [`${action.field}To`]: action.range.to,
      };

    case "SET_LOCATION":
      return {
        ...state,
        selectedCityId: action.cityId,
        radius: action.radius || state.radius,
      };

    case "ADD_MODEL":
      return {
        ...state,
        models: [...new Set([...state.models, ...action.models])],
      };

    case "REMOVE_MODEL":
      return {
        ...state,
        models: state.models.filter(model => !(state.makes.includes(action.make) && model === action.model)),
      };

    case "RESET_FILTERS":
      return {
        ...initialState,
        availableSavedSearches: state.availableSavedSearches,
      };

    case "LOAD_FROM_URL":
      return {
        ...state,
        ...action.filters,
      };

    case "LOAD_SAVED_SEARCH":
      return {
        ...state,
        ...action.search.filters,
        savedSearchName: action.search.name,
      };

    case "SET_APPLYING":
      return {
        ...state,
        isApplying: action.applying,
      };

    case "SET_RESULTS_COUNT":
      return {
        ...state,
        resultsCount: action.count,
      };

    default:
      return state;
  }
}

// Context interface
interface FilterContextType {
  state: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  setRange: (field: string, range: { from: number | null; to: number | null }) => void;
  toggleArrayItem: (field: keyof FilterState, value: string | number) => void;
  setLocation: (cityId: string | null, radius?: number) => void;
  resetFilters: () => void;
  applyFilters: () => Promise<void>;
  loadSavedSearch: (search: SavedSearch) => void;
  saveCurrentSearch: (name: string) => Promise<void>;
  deleteSavedSearch: (searchId: string) => Promise<void>;
  getActiveFiltersChips: () => FilterChip[];
  getActiveFiltersCount: () => number;
  loadVehicleOptions: (make?: string, model?: string) => Promise<void>;
  vehicleOptions: VehicleOptions;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// URL serialization utilities
const serializeFilters = (state: FilterState): URLFilterParams => {
  const params: URLFilterParams = {};
  
  // Vehicle basics
  if (state.makes.length > 0) params.makes = state.makes.join(",");
  if (state.models.length > 0) params.models = state.models.join(",");
  if (state.generations.length > 0) params.generations = state.generations.join(",");
  
  // Ranges
  if (state.yearFrom) params.year_from = state.yearFrom.toString();
  if (state.yearTo) params.year_to = state.yearTo.toString();
  if (state.priceFrom) params.price_from = state.priceFrom.toString();
  if (state.priceTo) params.price_to = state.priceTo.toString();
  if (state.mileageFrom) params.mileage_from = state.mileageFrom.toString();
  if (state.mileageTo) params.mileage_to = state.mileageTo.toString();
  
  // Vehicle characteristics
  if (state.bodyTypes.length > 0) params.body_types = state.bodyTypes.join(",");
  if (state.transmissions.length > 0) params.transmissions = state.transmissions.join(",");
  if (state.driveTypes.length > 0) params.drive_types = state.driveTypes.join(",");
  if (state.fuelTypes.length > 0) params.fuel_types = state.fuelTypes.join(",");
  
  // Engine specs
  if (state.displacementFrom) params.displacement_from = state.displacementFrom.toString();
  if (state.displacementTo) params.displacement_to = state.displacementTo.toString();
  if (state.powerFrom) params.power_from = state.powerFrom.toString();
  if (state.powerTo) params.power_to = state.powerTo.toString();
  
  // Vehicle details
  if (state.colors.length > 0) params.colors = state.colors.join(",");
  if (state.steeringWheel) params.steering_wheel = state.steeringWheel;
  
  // Condition
  if (state.ownersCount.length > 0) params.owners_count = state.ownersCount.join(",");
  if (state.accidentStatus.length > 0) params.accident_status = state.accidentStatus.join(",");
  if (state.originalTitle) params.original_title = "true";
  if (state.vinPresent) params.vin_present = "true";
  if (state.vinVerified) params.vin_verified = "true";
  if (state.serviceHistory) params.service_history = "true";
  if (state.excludeCommercial) params.exclude_commercial = "true";
  
  // Seller
  if (state.sellerTypes.length > 0) params.seller_types = state.sellerTypes.join(",");
  if (state.adSources.length > 0) params.ad_sources = state.adSources.join(",");
  
  // Auction
  if (state.auctionStates.length > 0 && !(state.auctionStates.length === 1 && state.auctionStates[0] === "live")) {
    params.auction_states = state.auctionStates.join(",");
  }
  if (state.endsWithin) params.ends_within = state.endsWithin;
  if (state.reserveOptions.length > 0) params.reserve_options = state.reserveOptions.join(",");
  if (state.buyNowAvailable) params.buy_now_available = "true";
  if (state.currentBidFrom) params.current_bid_from = state.currentBidFrom.toString();
  if (state.currentBidTo) params.current_bid_to = state.currentBidTo.toString();
  if (state.endDateFrom) params.end_date_from = state.endDateFrom.toISOString().split('T')[0];
  if (state.endDateTo) params.end_date_to = state.endDateTo.toISOString().split('T')[0];
  if (state.withInspection) params.with_inspection = "true";
  if (state.withQA) params.with_qa = "true";
  
  // Trust
  if (state.kycVerifiedSeller) params.kyc_verified_seller = "true";
  if (state.kycVerifiedBuyer) params.kyc_verified_buyer = "true";
  if (state.requiresDeposit) params.requires_deposit = "true";
  
  // Location
  if (state.regions.length > 0) params.regions = state.regions.join(",");
  if (state.cities.length > 0) params.cities = state.cities.join(",");
  if (state.selectedCityId) params.city_id = state.selectedCityId;
  if (state.radius !== 50) params.radius = state.radius.toString();
  if (state.pickupRequired) params.pickup_required = "true";
  if (state.deliveryAvailable) params.delivery_available = "true";
  
  // Media
  if (state.withVideo) params.with_video = "true";
  if (state.minPhotos > 0) params.min_photos = state.minPhotos.toString();
  if (state.mediaQualityScore > 0) params.media_quality_score = state.mediaQualityScore.toString();
  
  // Sorting and pagination
  if (state.sort !== "relevance") params.sort = state.sort;
  if (state.page > 1) params.page = state.page.toString();
  if (state.limit !== 24) params.limit = state.limit.toString();
  
  return params;
};

const parseFiltersFromURL = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};
  
  // Parse array parameters
  const makes = searchParams.get("makes");
  if (makes) filters.makes = makes.split(",");
  
  const models = searchParams.get("models");
  if (models) filters.models = models.split(",");
  
  const generations = searchParams.get("generations");
  if (generations) filters.generations = generations.split(",");
  
  const bodyTypes = searchParams.get("body_types");
  if (bodyTypes) filters.bodyTypes = bodyTypes.split(",") as any;
  
  const transmissions = searchParams.get("transmissions");
  if (transmissions) filters.transmissions = transmissions.split(",") as any;
  
  const driveTypes = searchParams.get("drive_types");
  if (driveTypes) filters.driveTypes = driveTypes.split(",") as any;
  
  const fuelTypes = searchParams.get("fuel_types");
  if (fuelTypes) filters.fuelTypes = fuelTypes.split(",") as any;
  
  const colors = searchParams.get("colors");
  if (colors) filters.colors = colors.split(",");
  
  const ownersCount = searchParams.get("owners_count");
  if (ownersCount) filters.ownersCount = ownersCount.split(",").map(Number);
  
  const accidentStatus = searchParams.get("accident_status");
  if (accidentStatus) filters.accidentStatus = accidentStatus.split(",") as any;
  
  const sellerTypes = searchParams.get("seller_types");
  if (sellerTypes) filters.sellerTypes = sellerTypes.split(",") as any;
  
  const adSources = searchParams.get("ad_sources");
  if (adSources) filters.adSources = adSources.split(",") as any;
  
  const auctionStates = searchParams.get("auction_states");
  if (auctionStates) filters.auctionStates = auctionStates.split(",") as any;
  
  const reserveOptions = searchParams.get("reserve_options");
  if (reserveOptions) filters.reserveOptions = reserveOptions.split(",") as any;
  
  const regions = searchParams.get("regions");
  if (regions) filters.regions = regions.split(",");
  
  const cities = searchParams.get("cities");
  if (cities) filters.cities = cities.split(",");
  
  // Parse numeric parameters
  const yearFrom = searchParams.get("year_from");
  if (yearFrom) filters.yearFrom = parseInt(yearFrom);
  
  const yearTo = searchParams.get("year_to");
  if (yearTo) filters.yearTo = parseInt(yearTo);
  
  const priceFrom = searchParams.get("price_from");
  if (priceFrom) filters.priceFrom = parseInt(priceFrom);
  
  const priceTo = searchParams.get("price_to");
  if (priceTo) filters.priceTo = parseInt(priceTo);
  
  const mileageFrom = searchParams.get("mileage_from");
  if (mileageFrom) filters.mileageFrom = parseInt(mileageFrom);
  
  const mileageTo = searchParams.get("mileage_to");
  if (mileageTo) filters.mileageTo = parseInt(mileageTo);
  
  const displacementFrom = searchParams.get("displacement_from");
  if (displacementFrom) filters.displacementFrom = parseFloat(displacementFrom);
  
  const displacementTo = searchParams.get("displacement_to");
  if (displacementTo) filters.displacementTo = parseFloat(displacementTo);
  
  const powerFrom = searchParams.get("power_from");
  if (powerFrom) filters.powerFrom = parseInt(powerFrom);
  
  const powerTo = searchParams.get("power_to");
  if (powerTo) filters.powerTo = parseInt(powerTo);
  
  const currentBidFrom = searchParams.get("current_bid_from");
  if (currentBidFrom) filters.currentBidFrom = parseInt(currentBidFrom);
  
  const currentBidTo = searchParams.get("current_bid_to");
  if (currentBidTo) filters.currentBidTo = parseInt(currentBidTo);
  
  // Parse date parameters
  const endDateFrom = searchParams.get("end_date_from");
  if (endDateFrom) filters.endDateFrom = new Date(endDateFrom);
  
  const endDateTo = searchParams.get("end_date_to");
  if (endDateTo) filters.endDateTo = new Date(endDateTo);
  
  const radius = searchParams.get("radius");
  if (radius) filters.radius = parseInt(radius);
  
  const minPhotos = searchParams.get("min_photos");
  if (minPhotos) filters.minPhotos = parseInt(minPhotos);
  
  const mediaQualityScore = searchParams.get("media_quality_score");
  if (mediaQualityScore) filters.mediaQualityScore = parseInt(mediaQualityScore);
  
  const page = searchParams.get("page");
  if (page) filters.page = parseInt(page);
  
  const limit = searchParams.get("limit");
  if (limit) filters.limit = parseInt(limit);
  
  // Parse string parameters
  const steeringWheel = searchParams.get("steering_wheel");
  if (steeringWheel) filters.steeringWheel = steeringWheel as any;
  
  const endsWithin = searchParams.get("ends_within");
  if (endsWithin) filters.endsWithin = endsWithin as any;
  
  const selectedCityId = searchParams.get("city_id");
  if (selectedCityId) filters.selectedCityId = selectedCityId;
  
  const sort = searchParams.get("sort");
  if (sort) filters.sort = sort;
  
  // Parse boolean parameters
  const originalTitle = searchParams.get("original_title");
  if (originalTitle === "true") filters.originalTitle = true;
  
  const vinPresent = searchParams.get("vin_present");
  if (vinPresent === "true") filters.vinPresent = true;
  
  const vinVerified = searchParams.get("vin_verified");
  if (vinVerified === "true") filters.vinVerified = true;
  
  const serviceHistory = searchParams.get("service_history");
  if (serviceHistory === "true") filters.serviceHistory = true;
  
  const buyNowAvailable = searchParams.get("buy_now_available");
  if (buyNowAvailable === "true") filters.buyNowAvailable = true;
  
  const withInspection = searchParams.get("with_inspection");
  if (withInspection === "true") filters.withInspection = true;
  
  const withQA = searchParams.get("with_qa");
  if (withQA === "true") filters.withQA = true;
  
  const kycVerifiedSeller = searchParams.get("kyc_verified_seller");
  if (kycVerifiedSeller === "true") filters.kycVerifiedSeller = true;
  
  const kycVerifiedBuyer = searchParams.get("kyc_verified_buyer");
  if (kycVerifiedBuyer === "true") filters.kycVerifiedBuyer = true;
  
  const requiresDeposit = searchParams.get("requires_deposit");
  if (requiresDeposit === "true") filters.requiresDeposit = true;
  
  const pickupRequired = searchParams.get("pickup_required");
  if (pickupRequired === "true") filters.pickupRequired = true;
  
  const deliveryAvailable = searchParams.get("delivery_available");
  if (deliveryAvailable === "true") filters.deliveryAvailable = true;
  
  const withVideo = searchParams.get("with_video");
  if (withVideo === "true") filters.withVideo = true;
  
  const excludeCommercial = searchParams.get("exclude_commercial");
  if (excludeCommercial === "true") filters.excludeCommercial = true;
  
  return filters;
};

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicleOptions, setVehicleOptions] = React.useState<VehicleOptions>({
    makes: [],
    modelsByMake: {},
    generationsByModel: {},
  });

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    if (Object.keys(urlFilters).length > 0) {
      dispatch({ type: "LOAD_FROM_URL", filters: urlFilters });
    }
  }, [searchParams]);

  // Auto-sync URL when filters change (debounced)
  useEffect(() => {
    // Skip URL updates during initial load to prevent overwrites
    if (JSON.stringify(state) === JSON.stringify(initialState)) return;
    
    const timeoutId = setTimeout(() => {
      // Serialize filters to URL params
      const urlParams = serializeFilters(state);
      const params = new URLSearchParams();
      
      Object.entries(urlParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      // Only update URL if parameters have actually changed
      const currentParams = searchParams.toString();
      const newParams = params.toString();
      
      if (currentParams !== newParams) {
        setSearchParams(params, { replace: true }); // Use replace to avoid cluttering browser history
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [state, setSearchParams, searchParams]);

  // Enhanced filter update methods
  const updateFilters = useCallback((filters: Partial<FilterState>) => {
    Object.entries(filters).forEach(([field, value]) => {
      dispatch({ type: "SET_FIELD", field: field as keyof FilterState, value });
    });
  }, []);

  const setRange = useCallback((field: string, range: { from: number | null; to: number | null }) => {
    dispatch({ type: "SET_RANGE", field, range });
  }, []);

  const toggleArrayItem = useCallback((field: keyof FilterState, value: string | number) => {
    // First, compute the next state for the toggled field
    const currentArray = state[field] as (string | number)[];
    const exists = currentArray.includes(value);
    const nextArray = exists
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    // Dispatch the main toggle
    dispatch({ type: "TOGGLE_ARRAY_ITEM", field, value });
    
    // Handle cascade clearing for dependent selects synchronously
    if (field === "makes" && exists) {
      // When removing a make, clear invalid models and generations
      const remainingMakes = nextArray as string[];
      
      // Clear models that don't belong to any remaining make
      const validModels = state.models.filter(model => {
        return remainingMakes.some(make => {
          const availableModels = vehicleOptions.modelsByMake[make] || [];
          return availableModels.includes(model);
        });
      });
      
      // Clear generations that don't belong to any valid make+model combination
      const validGenerations = state.generations.filter(generation => {
        return validModels.some(model => {
          return remainingMakes.some(make => {
            const key = `${make}|${model}`;
            const availableGenerations = vehicleOptions.generationsByModel[key] || [];
            return availableGenerations.includes(generation);
          });
        });
      });
      
      // Update state with filtered arrays if needed
      if (validModels.length !== state.models.length) {
        dispatch({ type: "SET_FIELD", field: "models", value: validModels });
      }
      if (validGenerations.length !== state.generations.length) {
        dispatch({ type: "SET_FIELD", field: "generations", value: validGenerations });
      }
    }
    
    if (field === "models" && exists) {
      // When removing a model, clear invalid generations
      const remainingModels = nextArray as string[];
      
      // Clear generations that don't belong to any remaining make+model combination
      const validGenerations = state.generations.filter(generation => {
        return remainingModels.some(model => {
          return state.makes.some(make => {
            const key = `${make}|${model}`;
            const availableGenerations = vehicleOptions.generationsByModel[key] || [];
            return availableGenerations.includes(generation);
          });
        });
      });
      
      // Update state with filtered generations if needed
      if (validGenerations.length !== state.generations.length) {
        dispatch({ type: "SET_FIELD", field: "generations", value: validGenerations });
      }
    }
  }, [state.makes, state.models, state.generations, vehicleOptions]);

  const setLocation = useCallback((cityId: string | null, radius?: number) => {
    dispatch({ type: "SET_LOCATION", cityId, radius });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    setSearchParams({});
  }, [setSearchParams]);

  const applyFilters = useCallback(async () => {
    dispatch({ type: "SET_APPLYING", applying: true });
    
    // Serialize filters to URL params
    const urlParams = serializeFilters(state);
    const params = new URLSearchParams();
    
    Object.entries(urlParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    setSearchParams(params);
    
    // Simulate API call delay
    setTimeout(() => {
      dispatch({ type: "SET_APPLYING", applying: false });
    }, 500);
  }, [state, setSearchParams]);

  const loadSavedSearch = useCallback((search: SavedSearch) => {
    dispatch({ type: "LOAD_SAVED_SEARCH", search });
  }, []);

  const saveCurrentSearch = useCallback(async (name: string) => {
    // TODO: Implement API call to save search
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      userId: "current-user", // Replace with actual user ID
      name,
      filters: { ...state },
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch({ 
      type: "SET_FIELD", 
      field: "availableSavedSearches", 
      value: [...state.availableSavedSearches, newSearch] 
    });
  }, [state]);

  const deleteSavedSearch = useCallback(async (searchId: string) => {
    // TODO: Implement API call to delete search
    dispatch({ 
      type: "SET_FIELD", 
      field: "availableSavedSearches", 
      value: state.availableSavedSearches.filter(s => s.id !== searchId) 
    });
  }, [state.availableSavedSearches]);

  const getActiveFiltersChips = useCallback((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Vehicle basics
    state.makes.forEach(make => {
      chips.push({
        key: `make-${make}`,
        label: make,
        category: "Vehicle",
        onRemove: () => toggleArrayItem("makes", make)
      });
    });

    state.models.forEach(model => {
      chips.push({
        key: `model-${model}`,
        label: model,
        category: "Vehicle",
        onRemove: () => toggleArrayItem("models", model)
      });
    });

    // Price range
    if (state.priceFrom || state.priceTo) {
      const from = state.priceFrom ? `от ${state.priceFrom.toLocaleString()} ₽` : "";
      const to = state.priceTo ? `до ${state.priceTo.toLocaleString()} ₽` : "";
      chips.push({
        key: "price",
        label: `Цена ${from} ${to}`.trim(),
        category: "Price",
        onRemove: () => setRange("price", { from: null, to: null })
      });
    }

    // Year range
    if (state.yearFrom || state.yearTo) {
      const from = state.yearFrom ? `от ${state.yearFrom}` : "";
      const to = state.yearTo ? `до ${state.yearTo}` : "";
      chips.push({
        key: "year",
        label: `Год ${from} ${to}`.trim(),
        category: "Year",
        onRemove: () => setRange("year", { from: null, to: null })
      });
    }

    // Body types
    state.bodyTypes.forEach(type => {
      chips.push({
        key: `body-${type}`,
        label: type,
        category: "Body Type",
        onRemove: () => toggleArrayItem("bodyTypes", type)
      });
    });

    // Auction states
    if (state.auctionStates.length !== 1 || !state.auctionStates.includes("live")) {
      state.auctionStates.forEach(status => {
        const label = status === "live" ? "В эфире" : 
                     status === "scheduled" ? "Запланирован" : "Завершён";
        chips.push({
          key: `auction-${status}`,
          label,
          category: "Auction",
          onRemove: () => toggleArrayItem("auctionStates", status)
        });
      });
    }

    // Add other filter chips as needed...

    return chips;
  }, [state, toggleArrayItem, setRange]);

  const getActiveFiltersCount = useCallback((): number => {
    let count = 0;
    
    if (state.makes.length > 0) count++;
    if (state.models.length > 0) count++;
    if (state.priceFrom || state.priceTo) count++;
    if (state.yearFrom || state.yearTo) count++;
    if (state.bodyTypes.length > 0) count++;
    if (state.transmissions.length > 0) count++;
    if (state.auctionStates.length !== 1 || !state.auctionStates.includes("live")) count++;
    if (state.reserveOptions.length > 0) count++;
    if (state.withInspection) count++;
    if (state.withVideo) count++;
    // Add other active filter checks...
    
    return count;
  }, [state]);

  const loadVehicleOptions = useCallback(async (make?: string, model?: string) => {
    // TODO: Implement API call to load vehicle options
    // For now, return mock data
    const mockOptions: VehicleOptions = {
      makes: ["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen", "Porsche", "Lexus", "Volvo"],
      modelsByMake: {
        "BMW": ["3 Series", "5 Series", "X3", "X5"],
        "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC"],
        "Audi": ["A4", "A6", "Q5", "Q7"],
        "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"],
      },
      generationsByModel: {
        "BMW|3 Series": ["F30", "G20"],
        "BMW|5 Series": ["F10", "G30"],
        "Mercedes-Benz|C-Class": ["W204", "W205"],
      },
    };
    
    setVehicleOptions(mockOptions);
  }, []);

  const contextValue: FilterContextType = {
    state,
    updateFilters,
    setRange,
    toggleArrayItem,
    setLocation,
    resetFilters,
    applyFilters,
    loadSavedSearch,
    saveCurrentSearch,
    deleteSavedSearch,
    getActiveFiltersChips,
    getActiveFiltersCount,
    loadVehicleOptions,
    vehicleOptions,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}