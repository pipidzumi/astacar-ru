import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, Expand, Grid3X3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ListingData } from "@/lib/mockData";

interface MediaGalleryProps {
  media: ListingData["media"];
  title: string;
}

export const MediaGallery = ({ media, title }: MediaGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const allMedia = [
    ...media.photos.map(photo => ({ ...photo, type: 'photo' as const })),
    ...media.videos.map((video, index) => ({ ...video, type: 'video' as const, alt: 'Видео', order: media.photos.length + index }))
  ].sort((a, b) => (a.order || 0) - (b.order || 0));

  const currentMedia = allMedia[selectedIndex];

  const nextMedia = () => {
    setSelectedIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = () => {
    setSelectedIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const displayPhotos = showAllPhotos ? media.photos : media.photos.slice(0, 8);

  return (
    <Card className="overflow-hidden">
      {/* Main Media Display */}
      <div className="relative aspect-[4/3] bg-muted">
        {currentMedia?.type === 'photo' ? (
          <img
            src={currentMedia.url}
            alt={currentMedia.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-black">
            <video
              src={currentMedia?.url}
              poster={currentMedia?.poster}
              className="w-full h-full object-cover"
              controls
            />
            <Badge className="absolute top-4 left-4 bg-black/70 text-white">
              <Play className="h-3 w-3 mr-1" />
              Видео
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
          onClick={prevMedia}
          disabled={allMedia.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
          onClick={nextMedia}
          disabled={allMedia.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Media Counter */}
        <Badge className="absolute bottom-4 right-4 bg-black/70 text-white">
          {selectedIndex + 1} из {allMedia.length}
        </Badge>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Expand className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnail Grid */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Фотографии ({media.photos.length})</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllPhotos(!showAllPhotos)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            {showAllPhotos ? "Скрыть" : "Все фото"}
          </Button>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo.order}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                selectedIndex === index ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </button>
          ))}
          
          {/* Video Thumbnails */}
          {media.videos.map((video, index) => {
            const videoIndex = media.photos.length + index;
            return (
              <button
                key={`video-${index}`}
                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  selectedIndex === videoIndex ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setSelectedIndex(videoIndex)}
              >
                <img
                  src={video.poster || '/placeholder-video.jpg'}
                  alt="Видео"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogTitle className="sr-only">{title} - Галерея</DialogTitle>
          <div className="relative aspect-video">
            {currentMedia?.type === 'photo' ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={currentMedia?.url}
                poster={currentMedia?.poster}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={prevMedia}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextMedia}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};