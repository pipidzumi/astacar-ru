import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { AuctionCard } from "@/components/AuctionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Shield, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import generated car images
import bmwImage from "@/assets/car-bmw-m3.jpg";
import mercedesImage from "@/assets/car-mercedes-g-class.jpg";
import porscheImage from "@/assets/car-porsche-911.jpg";

const mockAuctions = [
  {
    id: "1",
    title: "BMW M3 Competition",
    year: 2022,
    mileage: 15000,
    currentBid: 4200000,
    startPrice: 3800000,
    imageUrl: bmwImage,
    status: "live" as const,
    timeLeft: "2д 14ч",
    bidCount: 8,
    viewCount: 245,
    reserveMet: true
  },
  {
    id: "2", 
    title: "Mercedes-Benz G 63 AMG",
    year: 2023,
    mileage: 8500,
    currentBid: 8500000,
    startPrice: 8000000,
    imageUrl: mercedesImage,
    status: "ending" as const,
    timeLeft: "3ч 22м",
    bidCount: 15,
    viewCount: 412,
    reserveMet: true
  },
  {
    id: "3",
    title: "Porsche 911 Turbo S",
    year: 2021,
    mileage: 22000,
    currentBid: 9200000,
    startPrice: 8800000,
    imageUrl: porscheImage,
    status: "no-reserve" as const,
    timeLeft: "1д 8ч",
    bidCount: 22,
    viewCount: 678,
  }
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      <FilterBar />
      
      {/* Hero Section */}
      <section className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Премиальные автомобили на аукционе
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Покупайте и продавайте автомобили на прозрачном аукционе с экспертной оценкой
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, title: "Экспертная проверка", desc: "60+ фото и подробный отчёт" },
            { icon: Clock, title: "Прозрачные торги", desc: "Честный аукцион без скрытых ставок" },
            { icon: Award, title: "Гарантия сделки", desc: "Эскроу и защита покупателя" },
            { icon: TrendingUp, title: "Справедливая цена", desc: "Рыночная оценка экспертами" }
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Active Auctions */}
      <section className="container pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Активные аукционы</h2>
            <p className="text-muted-foreground">Текущие торги • Обновление в реальном времени</p>
          </div>
          <Badge variant="outline" className="bg-auction-live/10 text-auction-live border-auction-live/20">
            LIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockAuctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Нужна backend интеграция</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Для полноценной работы аукциона необходимо подключить Supabase для аутентификации, 
              базы данных, хранения файлов и real-time обновлений.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg" onClick={() => navigate('/sell')}>
                Продать автомобиль
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Посмотреть аукционы
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;