import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { MediaGallery } from "@/components/listing/MediaGallery";
import { ListingHeader } from "@/components/listing/ListingHeader";
import { BiddingInterface } from "@/components/listing/BiddingInterface";
import { VehicleDetails } from "@/components/listing/VehicleDetails";
import { InspectionReport } from "@/components/listing/InspectionReport";
import { BidHistory } from "@/components/listing/BidHistory";
import { QASection } from "@/components/listing/QASection";
import { SellerInfo } from "@/components/listing/SellerInfo";
import { PolicyInfo } from "@/components/listing/PolicyInfo";
import { mockListingData } from "@/lib/mockData";
import { useEffect, useState } from "react";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<typeof mockListingData | null>(null);
  const [serverTime, setServerTime] = useState(new Date());

  useEffect(() => {
    // Simulate fetching listing data
    if (id) {
      setListing(mockListingData);
    }
    
    // Update server time every second
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [id]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Header />
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Лот не найден</h1>
            <p className="text-muted-foreground">Указанный лот не существует или был удален</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      
      <div className="container py-6">
        <ListingHeader listing={listing} serverTime={serverTime} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <MediaGallery media={listing.media} title={listing.vehicle.title} />
            <VehicleDetails vehicle={listing.vehicle} />
            <InspectionReport inspection={listing.inspection} />
            <BidHistory bids={listing.bidding.bidHistory} />
            <QASection qa={listing.qa} listingId={listing.id} />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <BiddingInterface 
              listing={listing} 
              serverTime={serverTime}
              onBidUpdate={(newBid) => {
                setListing(prev => prev ? {
                  ...prev,
                  pricing: { ...prev.pricing, currentPrice: newBid.amount },
                  bidding: {
                    ...prev.bidding,
                    bidHistory: [newBid, ...prev.bidding.bidHistory]
                  }
                } : null);
              }}
            />
            <SellerInfo 
              sellerId={listing.meta.sellerId}
              sellerRating={listing.meta.sellerRating}
              sellerHistoryCount={listing.meta.sellerHistoryCount}
            />
            <PolicyInfo policy={listing.policy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;