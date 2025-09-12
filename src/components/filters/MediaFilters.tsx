import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "./FilterProvider";

export function MediaFilters() {
  const { state, updateFilters } = useFilters();

  const photoOptions = [0, 10, 20, 30, 50, 80];
  const qualityOptions = [0, 3, 5, 7, 8, 9];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Медиа и качество</h3>

        {/* With video */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">С видео</Label>
          <Switch
            checked={state.withVideo}
            onCheckedChange={(checked) => updateFilters({ withVideo: checked })}
            data-testid="switch-with-video"
          />
        </div>

        {/* Minimum photos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Минимум фотографий: {state.minPhotos === 0 ? "Любое количество" : `${state.minPhotos}+`}
          </Label>
          <div className="px-2">
            <Slider
              value={[state.minPhotos]}
              onValueChange={([value]) => updateFilters({ minPhotos: value })}
              min={0}
              max={80}
              step={10}
              className="w-full"
              data-testid="slider-min-photos"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>40</span>
              <span>80+</span>
            </div>
          </div>
          
          {/* Quick photo count buttons */}
          <div className="flex flex-wrap gap-2">
            {photoOptions.map((count) => (
              <Badge
                key={count}
                variant={state.minPhotos === count ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => updateFilters({ minPhotos: count })}
                data-testid={`min-photos-${count}`}
              >
                {count === 0 ? "Любое" : `${count}+`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Media quality score */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Качество медиа: {state.mediaQualityScore === 0 ? "Любое" : `${state.mediaQualityScore}/10`}
          </Label>
          <div className="px-2">
            <Slider
              value={[state.mediaQualityScore]}
              onValueChange={([value]) => updateFilters({ mediaQualityScore: value })}
              min={0}
              max={10}
              step={1}
              className="w-full"
              data-testid="slider-media-quality"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Любое</span>
              <span>Среднее (5)</span>
              <span>Отличное (10)</span>
            </div>
          </div>
          
          {/* Quick quality buttons */}
          <div className="flex flex-wrap gap-2">
            {qualityOptions.map((score) => (
              <Badge
                key={score}
                variant={state.mediaQualityScore === score ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => updateFilters({ mediaQualityScore: score })}
                data-testid={`media-quality-${score}`}
              >
                {score === 0 ? "Любое" : score.toString()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Additional media filters */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground">Дополнительные медиа фильтры</h4>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Высокое разрешение фотографий</Label>
            <Switch
              checked={state.mediaQualityScore >= 7}
              onCheckedChange={(checked) => updateFilters({ 
                mediaQualityScore: checked ? 7 : 0 
              })}
              data-testid="switch-high-resolution"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Профессиональная фотосъемка</Label>
            <Switch
              checked={state.mediaQualityScore >= 9}
              onCheckedChange={(checked) => updateFilters({ 
                mediaQualityScore: checked ? 9 : 0 
              })}
              data-testid="switch-professional-photos"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Много ракурсов (50+ фото)</Label>
            <Switch
              checked={state.minPhotos >= 50}
              onCheckedChange={(checked) => updateFilters({ 
                minPhotos: checked ? 50 : 0 
              })}
              data-testid="switch-many-angles"
            />
          </div>
        </div>

        {/* Media completeness indicators */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground">Полнота информации</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">Фото</div>
              <div className="text-muted-foreground">
                {state.minPhotos === 0 ? "Любое" : `${state.minPhotos}+`}
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">Видео</div>
              <div className="text-muted-foreground">
                {state.withVideo ? "Обязательно" : "Необязательно"}
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">Качество</div>
              <div className="text-muted-foreground">
                {state.mediaQualityScore === 0 ? "Любое" : `${state.mediaQualityScore}/10`}
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">Экспертиза</div>
              <div className="text-muted-foreground">
                {state.withInspection ? "Да" : "Необязательно"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}