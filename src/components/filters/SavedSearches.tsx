import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bookmark, BookmarkPlus, Trash2, Search } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { SavedSearch } from "@/types/filters";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function SavedSearches() {
  const { 
    state,
    saveCurrentSearch, 
    loadSavedSearch, 
    deleteSavedSearch 
  } = useFilters();
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;
    
    setIsLoading(true);
    try {
      await saveCurrentSearch(searchName.trim());
      setSearchName("");
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Failed to save search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSearch = async (search: SavedSearch) => {
    try {
      loadSavedSearch(search);
    } catch (error) {
      console.error("Failed to load search:", error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      await deleteSavedSearch(searchId);
    } catch (error) {
      console.error("Failed to delete search:", error);
    }
  };

  const hasActiveFilters = () => {
    // Check if any filters are active (not default values)
    return (
      state.makes.length > 0 ||
      state.models.length > 0 ||
      state.generations.length > 0 ||
      state.yearFrom !== null ||
      state.yearTo !== null ||
      state.priceFrom !== null ||
      state.priceTo !== null ||
      state.mileageFrom !== null ||
      state.mileageTo !== null ||
      state.bodyTypes.length > 0 ||
      state.transmissions.length > 0 ||
      state.driveTypes.length > 0 ||
      state.fuelTypes.length > 0 ||
      state.colors.length > 0 ||
      state.steeringWheel !== null ||
      state.ownersCount.length > 0 ||
      state.accidentStatus.length > 0 ||
      state.originalTitle ||
      state.vinPresent ||
      state.vinVerified ||
      state.serviceHistory ||
      state.excludeCommercial ||
      state.sellerTypes.length > 0 ||
      state.adSources.length > 0 ||
      (state.auctionStates.length !== 1 || state.auctionStates[0] !== "live") ||
      state.endsWithin !== null ||
      state.endDateFrom !== null ||
      state.endDateTo !== null ||
      state.reserveOptions.length > 0 ||
      state.buyNowAvailable ||
      state.currentBidFrom !== null ||
      state.currentBidTo !== null ||
      state.withInspection ||
      state.withQA ||
      state.kycVerifiedSeller ||
      state.kycVerifiedBuyer ||
      state.requiresDeposit ||
      state.regions.length > 0 ||
      state.cities.length > 0 ||
      state.selectedCityId !== null ||
      state.radius !== 50 ||
      state.pickupRequired ||
      state.deliveryAvailable ||
      state.withVideo ||
      state.minPhotos > 0 ||
      state.mediaQualityScore > 0
    );
  };

  return (
    <div className="flex gap-2" data-testid="saved-searches-controls">
      {/* Save Current Search */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasActiveFilters()}
            data-testid="button-save-search"
            className="text-sm"
          >
            <BookmarkPlus className="h-4 w-4 mr-1" />
            Сохранить поиск
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохранить текущий поиск</DialogTitle>
            <DialogDescription>
              Дайте название вашему поиску, чтобы легко найти его позже
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="search-name">Название поиска</Label>
              <Input
                id="search-name"
                placeholder="Например: BMW X5 2015-2020"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchName.trim()) {
                    handleSaveSearch();
                  }
                }}
                data-testid="input-search-name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(false)}
              data-testid="button-cancel-save"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSaveSearch}
              disabled={!searchName.trim() || isLoading}
              data-testid="button-confirm-save"
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Saved Search */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={state.availableSavedSearches.length === 0}
            data-testid="button-load-search"
            className="text-sm"
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Мои поиски
            {state.availableSavedSearches.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {state.availableSavedSearches.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="text-sm font-medium">
            Сохранённые поиски
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {state.availableSavedSearches.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              У вас пока нет сохранённых поисков
            </div>
          ) : (
            state.availableSavedSearches.map((search) => (
              <div key={search.id} className="group">
                <DropdownMenuItem
                  className="cursor-pointer p-3"
                  onClick={() => handleLoadSearch(search)}
                  data-testid={`item-search-${search.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate pr-2">
                        {search.name}
                        {state.savedSearchName === search.name && (
                          <span className="ml-2 text-xs text-primary">• активен</span>
                        )}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`button-delete-${search.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить сохранённый поиск?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Поиск "{search.name}" будет удалён безвозвратно.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">
                              Отмена
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSearch(search.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid="button-confirm-delete"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Создан {formatDistanceToNow(search.createdAt, { 
                        addSuffix: true,
                        locale: ru 
                      })}
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}