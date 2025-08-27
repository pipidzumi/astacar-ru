import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  Pause,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

interface Listing {
  id: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  start_price: number;
  current_price: number;
  reserve_price: number | null;
  buy_now_price: number | null;
  seller_id: string;
  vehicle_id: string;
  created_at: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    vin: string;
  };
  bids?: { count: number }[];
}

interface ModerationAction {
  action: 'approve' | 'reject' | 'request_changes';
  reason: string;
  comments?: string;
}

const ListingsManagement: React.FC = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<ModerationAction>({
    action: 'approve',
    reason: ''
  });

  useEffect(() => {
    loadListings();
  }, [selectedTab, statusFilter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('listings')
        .select(`
          *,
          vehicle:vehicles(make, model, year, vin),
          bids(count)
        `);

      // Apply filters based on tab
      switch (selectedTab) {
        case 'queue':
          query = query.in('status', ['draft', 'moderation']);
          break;
        case 'live':
          query = query.eq('status', 'live');
          break;
        case 'scheduled':
          query = query.eq('status', 'live').not('start_at', 'is', null);
          break;
        case 'finished':
          query = query.eq('status', 'finished');
          break;
        default:
          if (statusFilter !== 'all' && ['draft', 'moderation', 'live', 'finished', 'cancelled'].includes(statusFilter)) {
            query = query.eq('status', statusFilter as any);
          }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить лоты",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async () => {
    if (!selectedListing || !moderationAction.reason) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call Edge Function for moderation
      const { error } = await supabase.functions.invoke('admin-listings-moderate', {
        body: {
          listing_id: selectedListing.id,
          action: moderationAction.action,
          reason: moderationAction.reason,
          comments: moderationAction.comments
        }
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: `Лот ${moderationAction.action === 'approve' ? 'одобрен' : 
          moderationAction.action === 'reject' ? 'отклонен' : 'отправлен на доработку'}`
      });

      setModerationDialog(false);
      setSelectedListing(null);
      setModerationAction({ action: 'approve', reason: '' });
      loadListings();
    } catch (error) {
      console.error('Error moderating listing:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить модерацию",
        variant: "destructive"
      });
    }
  };

  const handleSchedule = async (listingId: string, startTime: string, endTime: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-listings-schedule', {
        body: {
          listing_id: listingId,
          start_at: startTime,
          end_at: endTime
        }
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Аукцион запланирован"
      });

      loadListings();
    } catch (error) {
      console.error('Error scheduling listing:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось запланировать аукцион",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-listings-status', {
        body: {
          listing_id: listingId,
          status: newStatus
        }
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Статус изменен"
      });

      loadListings();
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Черновик', variant: 'secondary' },
      moderation: { label: 'На модерации', variant: 'default' },
      live: { label: 'Активный', variant: 'default' },
      finished: { label: 'Завершен', variant: 'secondary' },
      cancelled: { label: 'Отменен', variant: 'destructive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' };
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityLevel = (listing: Listing) => {
    if (listing.status === 'live' && listing.end_at) {
      const endTime = new Date(listing.end_at);
      const now = new Date();
      const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursLeft < 1) return { level: 'high', label: 'Критично' };
      if (hoursLeft < 6) return { level: 'medium', label: 'Внимание' };
    }
    
    if (listing.status === 'moderation') {
      const daysSinceSubmission = (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSubmission > 2) return { level: 'medium', label: 'Просрочено' };
    }
    
    return { level: 'low', label: 'Обычный' };
  };

  const filteredListings = listings.filter(listing => {
    const searchMatch = !searchTerm || 
      listing.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.vehicle?.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление лотами</h1>
          <p className="text-muted-foreground">Модерация, планирование и управление аукционами</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </Button>
          <Button>Создать лот</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по марке, модели или VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="submitted">На модерации</SelectItem>
                <SelectItem value="approved">Одобрен</SelectItem>
                <SelectItem value="live">Активный</SelectItem>
                <SelectItem value="finished">Завершен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="queue">Очередь ({listings.filter(l => ['draft', 'moderation'].includes(l.status)).length})</TabsTrigger>
          <TabsTrigger value="live">Активные ({listings.filter(l => l.status === 'live').length})</TabsTrigger>
          <TabsTrigger value="scheduled">Запланированные ({listings.filter(l => l.status === 'live' && l.start_at).length})</TabsTrigger>
          <TabsTrigger value="finished">Завершенные</TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === 'queue' && 'Очередь модерации'}
                {selectedTab === 'live' && 'Активные аукционы'}
                {selectedTab === 'scheduled' && 'Запланированные аукционы'}
                {selectedTab === 'finished' && 'Завершенные аукционы'}
                {selectedTab === 'all' && 'Все лоты'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Автомобиль</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead>Ставки</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const priority = getPriorityLevel(listing);
                      return (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {listing.vehicle?.year} {listing.vehicle?.make} {listing.vehicle?.model}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                VIN: {listing.vehicle?.vin?.slice(-8)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(listing.status)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {(listing.current_price / 100).toLocaleString('ru-RU')} ₽
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Старт: {(listing.start_price / 100).toLocaleString('ru-RU')} ₽
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {listing.start_at && (
                                <p>Начало: {new Date(listing.start_at).toLocaleString('ru-RU')}</p>
                              )}
                              {listing.end_at && (
                                <p>Конец: {new Date(listing.end_at).toLocaleString('ru-RU')}</p>
                              )}
                              {!listing.start_at && !listing.end_at && (
                                <p className="text-muted-foreground">Не запланирован</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {listing.bids?.[0]?.count || 0} ставок
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={priority.level === 'high' ? 'destructive' : 
                                     priority.level === 'medium' ? 'secondary' : 'outline'}
                            >
                              {priority.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {listing.status === 'moderation' && (
                                <Dialog open={moderationDialog && selectedListing?.id === listing.id} onOpenChange={setModerationDialog}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setSelectedListing(listing)}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Модерация лота</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Select 
                                        value={moderationAction.action} 
                                        onValueChange={(value: any) => setModerationAction(prev => ({ ...prev, action: value }))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="approve">Одобрить</SelectItem>
                                          <SelectItem value="reject">Отклонить</SelectItem>
                                          <SelectItem value="request_changes">Запросить изменения</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      <Input
                                        placeholder="Причина (обязательно)"
                                        value={moderationAction.reason}
                                        onChange={(e) => setModerationAction(prev => ({ ...prev, reason: e.target.value }))}
                                      />
                                      
                                      <Textarea
                                        placeholder="Комментарии (опционально)"
                                        value={moderationAction.comments || ''}
                                        onChange={(e) => setModerationAction(prev => ({ ...prev, comments: e.target.value }))}
                                      />
                                      
                                      <div className="flex gap-2">
                                        <Button onClick={handleModeration}>
                                          Применить
                                        </Button>
                                        <Button variant="outline" onClick={() => setModerationDialog(false)}>
                                          Отмена
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              
                              {listing.status === 'draft' && (
                                <Button size="sm" variant="outline">
                                  <Calendar className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {listing.status === 'live' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusChange(listing.id, 'paused')}
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ListingsManagement;