import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export interface FilterState {
  // Basics
  makes: string[];
  models: string[];
  generations: string[];
  priceFrom: number | null;
  priceTo: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  mileageFrom: number | null;
  mileageTo: number | null;
  bodyTypes: string[];
  transmissions: string[];
  driveTypes: string[];
  fuelTypes: string[];
  engineFrom: number | null;
  engineTo: number | null;
  powerFrom: number | null;
  powerTo: number | null;
  
  // Location
  regions: string[];
  cities: string[];
  radius: number;
  nearbyMe: boolean;
  deliveryAvailable: boolean;
  
  // Auction parameters
  auctionStates: string[];
  endsWithin: string | null;
  reserveOptions: string[];
  currentBidFrom: number | null;
  currentBidTo: number | null;
  buyNowAvailable: boolean;
  
  // Condition
  ownersCount: string[];
  accidentStatus: string[];
  bodyCondition: string[];
  serviceHistory: boolean;
  originalTitle: boolean;
  vinAvailable: boolean;
  vinVerified: boolean;
  excludeCommercial: boolean;
  
  // Features
  features: string[];
  colors: string[];
  
  // Seller
  sellerTypes: string[];
  withVideo: boolean;
  minPhotos: number;
  withInspection: boolean;
  withQA: boolean;
  
  // Meta
  sort: string;
  isApplying: boolean;
}

type FilterAction = 
  | { type: "SET_FIELD"; field: keyof FilterState; value: any }
  | { type: "TOGGLE_ARRAY_ITEM"; field: keyof FilterState; value: string }
  | { type: "RESET_FILTERS" }
  | { type: "LOAD_FROM_URL"; filters: Partial<FilterState> }
  | { type: "SET_APPLYING"; applying: boolean };

const initialState: FilterState = {
  makes: [],
  models: [],
  generations: [],
  priceFrom: null,
  priceTo: null,
  yearFrom: null,
  yearTo: null,
  mileageFrom: null,
  mileageTo: null,
  bodyTypes: [],
  transmissions: [],
  driveTypes: [],
  fuelTypes: [],
  engineFrom: null,
  engineTo: null,
  powerFrom: null,
  powerTo: null,
  regions: [],
  cities: [],
  radius: 50,
  nearbyMe: false,
  deliveryAvailable: false,
  auctionStates: ["live"],
  endsWithin: null,
  reserveOptions: [],
  currentBidFrom: null,
  currentBidTo: null,
  buyNowAvailable: false,
  ownersCount: [],
  accidentStatus: [],
  bodyCondition: [],
  serviceHistory: false,
  originalTitle: false,
  vinAvailable: false,
  vinVerified: false,
  excludeCommercial: false,
  features: [],
  colors: [],
  sellerTypes: [],
  withVideo: false,
  minPhotos: 0,
  withInspection: false,
  withQA: false,
  sort: "relevance",
  isApplying: false,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    
    case "TOGGLE_ARRAY_ITEM": {
      const currentArray = state[action.field] as string[];
      const newArray = currentArray.includes(action.value)
        ? currentArray.filter(item => item !== action.value)
        : [...currentArray, action.value];
      return { ...state, [action.field]: newArray };
    }
    
    case "RESET_FILTERS":
      return { ...initialState };
    
    case "LOAD_FROM_URL":
      return { ...state, ...action.filters };
    
    case "SET_APPLYING":
      return { ...state, isApplying: action.applying };
    
    default:
      return state;
  }
}

const FilterContext = createContext<{
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  updateFilters: (filters: Partial<FilterState>) => void;
  toggleArrayItem: (field: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  applyFilters: () => void;
} | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};
    
    // Parse array parameters
    const makes = searchParams.get("makes");
    if (makes) urlFilters.makes = makes.split(",");
    
    const models = searchParams.get("models");
    if (models) urlFilters.models = models.split(",");
    
    // Parse numeric parameters
    const priceFrom = searchParams.get("price_from");
    if (priceFrom) urlFilters.priceFrom = parseInt(priceFrom);
    
    const priceTo = searchParams.get("price_to");
    if (priceTo) urlFilters.priceTo = parseInt(priceTo);
    
    const yearFrom = searchParams.get("year_from");
    if (yearFrom) urlFilters.yearFrom = parseInt(yearFrom);
    
    const yearTo = searchParams.get("year_to");
    if (yearTo) urlFilters.yearTo = parseInt(yearTo);
    
    // Parse other parameters
    const sort = searchParams.get("sort");
    if (sort) urlFilters.sort = sort;
    
    if (Object.keys(urlFilters).length > 0) {
      dispatch({ type: "LOAD_FROM_URL", filters: urlFilters });
    }
  }, [searchParams]);

  const updateFilters = (filters: Partial<FilterState>) => {
    Object.entries(filters).forEach(([field, value]) => {
      dispatch({ type: "SET_FIELD", field: field as keyof FilterState, value });
    });
  };

  const toggleArrayItem = (field: keyof FilterState, value: string) => {
    dispatch({ type: "TOGGLE_ARRAY_ITEM", field, value });
  };

  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
    setSearchParams({});
  };

  const applyFilters = () => {
    dispatch({ type: "SET_APPLYING", applying: true });
    
    // Build URL params
    const params = new URLSearchParams();
    
    if (state.makes.length > 0) params.set("makes", state.makes.join(","));
    if (state.models.length > 0) params.set("models", state.models.join(","));
    if (state.priceFrom) params.set("price_from", state.priceFrom.toString());
    if (state.priceTo) params.set("price_to", state.priceTo.toString());
    if (state.yearFrom) params.set("year_from", state.yearFrom.toString());
    if (state.yearTo) params.set("year_to", state.yearTo.toString());
    if (state.sort !== "relevance") params.set("sort", state.sort);
    
    setSearchParams(params);
    
    // Simulate API call delay
    setTimeout(() => {
      dispatch({ type: "SET_APPLYING", applying: false });
    }, 500);
  };

  return (
    <FilterContext.Provider value={{
      state,
      dispatch,
      updateFilters,
      toggleArrayItem,
      resetFilters,
      applyFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}