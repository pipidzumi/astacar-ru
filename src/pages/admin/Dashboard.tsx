import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  Gavel, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';

interface DashboardStats {
  activeLive: number;
  ending60min: number;
  sellThrough: number;
  avgBidsPerListing: number;
  medianTimeToFirstBid: number;
  winnerCancellations: number;
  openDisputes: number;
  revenuePeriod: number;
}

interface LiveEvent {
  id: string;
  type: 'bid' | 'antisnipe' | 'buynow' | 'kyc' | 'payment' | 'dispute';
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
  listing_id?: string;
  user_id?: string;
}

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeLive: 0,
    ending60min: 0,
    sellThrough: 0,
    avgBidsPerListing: 0,
    medianTimeToFirstBid: 0,
    winnerCancellations: 0,
    openDisputes: 0,
    revenuePeriod: 0
  });
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    setupRealtimeSubscriptions();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats from multiple tables
      const [listingsRes, bidsRes, disputesRes, transactionsRes] = await Promise.all([
        supabase.from('listings').select('status, end_at, current_price, start_price'),
        supabase.from('bids').select('listing_id, amount, placed_at'),
        supabase.from('disputes').select('status'),
        supabase.from('transactions').select('vehicle_amount, status, created_at')
      ]);

      if (listingsRes.data && bidsRes.data && disputesRes.data && transactionsRes.data) {
        const listings = listingsRes.data;
        const bids = bidsRes.data;
        const disputes = disputesRes.data;
        const transactions = transactionsRes.data;

        // Calculate stats
        const activeLive = listings.filter(l => l.status === 'live').length;
        const now = new Date();
        const ending60min = listings.filter(l => 
          l.status === 'live' && 
          l.end_at && 
          new Date(l.end_at).getTime() - now.getTime() < 60 * 60 * 1000
        ).length;

        const finishedListings = listings.filter(l => l.status === 'finished');
        const soldListings = finishedListings.filter(l => l.current_price > l.start_price);
        const sellThrough = finishedListings.length > 0 ? (soldListings.length / finishedListings.length) * 100 : 0;

        const bidsByListing = bids.reduce((acc, bid) => {
          acc[bid.listing_id] = (acc[bid.listing_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const avgBidsPerListing = Object.keys(bidsByListing).length > 0 
          ? Object.values(bidsByListing).reduce((sum, count) => sum + count, 0) / Object.keys(bidsByListing).length 
          : 0;

        const openDisputes = disputes.filter(d => d.status === 'open').length;
        const revenuePeriod = transactions
          .filter(t => t.status === 'paid')
          .reduce((sum, t) => sum + (t.vehicle_amount || 0), 0);

        setStats({
          activeLive,
          ending60min,
          sellThrough: Math.round(sellThrough),
          avgBidsPerListing: Math.round(avgBidsPerListing * 10) / 10,
          medianTimeToFirstBid: 0, // Would need more complex calculation
          winnerCancellations: 0, // Would need tracking table
          openDisputes,
          revenuePeriod: revenuePeriod / 100 // Convert from cents
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные панели управления",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to real-time events
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids' },
        (payload) => {
          addLiveEvent({
            id: crypto.randomUUID(),
            type: 'bid',
            title: 'Новая ставка',
            description: `Ставка на сумму ${(payload.new.amount / 100).toLocaleString('ru-RU')} ₽`,
            timestamp: new Date().toISOString(),
            severity: 'info',
            listing_id: payload.new.listing_id,
            user_id: payload.new.bidder_id
          });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.new.status === 'finished' && payload.old.status === 'live') {
            addLiveEvent({
              id: crypto.randomUUID(),
              type: 'buynow',
              title: 'Аукцион завершен',
              description: `Аукцион завершился по цене ${(payload.new.current_price / 100).toLocaleString('ru-RU')} ₽`,
              timestamp: new Date().toISOString(),
              severity: 'info',
              listing_id: payload.new.id
            });
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'disputes' },
        (payload) => {
          addLiveEvent({
            id: crypto.randomUUID(),
            type: 'dispute',
            title: 'Новый диспут',
            description: `Открыт диспут по причине: ${payload.new.reason_type}`,
            timestamp: new Date().toISOString(),
            severity: 'warning',
            listing_id: payload.new.listing_id,
            user_id: payload.new.initiator_id
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addLiveEvent = (event: LiveEvent) => {
    setLiveEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    
    // Refresh stats periodically
    if (Math.random() < 0.1) { // 10% chance to refresh stats
      loadDashboardData();
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bid': return <Gavel className="w-4 h-4" />;
      case 'antisnipe': return <Zap className="w-4 h-4" />;
      case 'buynow': return <DollarSign className="w-4 h-4" />;
      case 'kyc': return <Users className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'dispute': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <p className="text-muted-foreground">Обзор платформы и ключевые метрики</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            Обновить
          </Button>
          <Button>Быстрые действия</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные аукционы</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ending60min} завершаются в течение часа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продаваемость</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sellThrough}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgBidsPerListing} ставок в среднем
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка за период</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenuePeriod.toLocaleString('ru-RU')} ₽</div>
            <p className="text-xs text-muted-foreground">
              {stats.winnerCancellations} отказов победителей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Открытые диспуты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openDisputes}</div>
            <p className="text-xs text-muted-foreground">
              Требуют внимания
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Лента событий</TabsTrigger>
          <TabsTrigger value="actions">Быстрые действия</TabsTrigger>
          <TabsTrigger value="alerts">Уведомления</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Лента событий в реальном времени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Ожидание событий...
                  </p>
                ) : (
                  liveEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{event.title}</p>
                          <Badge variant={getEventColor(event.severity) as any} className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      {event.listing_id && (
                        <Button variant="ghost" size="sm">
                          Перейти
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Завершающиеся аукционы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.ending60min} аукционов завершаются в течение часа
                </p>
                <Button className="w-full">Перейти к мониторингу</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Очередь модерации</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Проверить новые заявки на публикацию
                </p>
                <Button className="w-full" variant="outline">Перейти к модерации</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Диспуты</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.openDisputes} открытых диспутов требуют решения
                </p>
                <Button className="w-full" variant="outline">Рассмотреть диспуты</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Системные уведомления</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Нет активных уведомлений</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;