import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Image,
  Video,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Pin,
  Trash2,
  Edit,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface MediaAsset {
  id: string;
  listing_id: string;
  url: string;
  type: 'photo' | 'video';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  order_index: number;
  created_at: string;
  listing: {
    make: string;
    model: string;
    year: number;
    seller: {
      full_name: string;
    };
  };
}

interface QAThread {
  id: string;
  listing_id: string;
  question: string;
  answer?: string;
  questioner_id: string;
  answerer_id?: string;
  status: 'pending' | 'answered' | 'flagged' | 'removed';
  created_at: string;
  listing: {
    make: string;
    model: string;
    year: number;
  };
}

const MediaModeration: React.FC = () => {
  const { toast } = useToast();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [qaThreads, setQAThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedQA, setSelectedQA] = useState<QAThread | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      // Load media assets
      const { data: media, error: mediaError } = await supabase
        .from('media_assets')
        .select(`
          *,
          listings!inner(
            make,
            model,
            year,
            vehicles!inner(make, model, year),
            profiles!inner(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (mediaError) throw mediaError;

      // Load Q&A threads
      const { data: qa, error: qaError } = await supabase
        .from('qa_threads')
        .select(`
          *,
          listings!inner(
            make,
            model,
            year,
            vehicles!inner(make, model, year)
          )
        `)
        .order('created_at', { ascending: false });

      if (qaError) throw qaError;

      setMediaAssets((media || []).map(m => ({ 
        ...m, 
        status: 'needs_review' as any, 
        listing: m.listings as any 
      })) as MediaAsset[]);
      setQAThreads((qa || []).map(q => ({ 
        ...q, 
        status: 'open' as any, 
        listing: q.listings as any 
      })) as QAThread[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные модерации",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const mediaChannel = supabase
      .channel('media-moderation')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_assets' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qa_threads' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
    };
  };

  const handleMediaAction = async (assetId: string, action: 'approve' | 'reject' | 'flag') => {
    if (!actionReason.trim()) {
      toast({
        title: "Требуется причина",
        description: "Укажите причину действия",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-media-moderate', {
        body: {
          asset_id: assetId,
          action,
          reason: actionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Действие выполнено",
        description: `Медиа ${action === 'approve' ? 'одобрено' : action === 'reject' ? 'отклонено' : 'помечено флагом'}`
      });

      setActionReason('');
      setSelectedAsset(null);
      loadData();
    } catch (error) {
      console.error('Error moderating media:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    }
  };

  const handleQAAction = async (threadId: string, action: 'remove' | 'restore' | 'pin') => {
    if (!actionReason.trim()) {
      toast({
        title: "Требуется причина",
        description: "Укажите причину действия",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-qa-moderate', {
        body: {
          thread_id: threadId,
          action,
          reason: actionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Действие выполнено",
        description: `Q&A ${action === 'remove' ? 'удален' : action === 'restore' ? 'восстановлен' : 'закреплен'}`
      });

      setActionReason('');
      setSelectedQA(null);
      loadData();
    } catch (error) {
      console.error('Error moderating Q&A:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'На проверке' },
      approved: { variant: 'default' as const, text: 'Одобрено' },
      rejected: { variant: 'destructive' as const, text: 'Отклонено' },
      flagged: { variant: 'destructive' as const, text: 'Помечено' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config?.variant || 'secondary'}>{config?.text || status}</Badge>;
  };

  const filteredMedia = mediaAssets.filter(asset => {
    const statusMatch = statusFilter === 'all' || asset.status === statusFilter;
    const typeMatch = typeFilter === 'all' || asset.type === typeFilter;
    const searchMatch = searchTerm === '' || 
      asset.listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.listing.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const filteredQA = qaThreads.filter(thread => {
    const searchMatch = searchTerm === '' || 
      thread.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.listing.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Модерация контента</h1>
          <p className="text-muted-foreground">Проверка медиа и Q&A материалов</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">На проверке</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mediaAssets.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Помечено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mediaAssets.filter(a => a.status === 'flagged').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Одобрено сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mediaAssets.filter(a => a.status === 'approved' && 
                new Date(a.created_at).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Q&A на модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qaThreads.filter(q => q.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Очередь модерации</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">На проверке</SelectItem>
                  <SelectItem value="flagged">Помечено</SelectItem>
                  <SelectItem value="approved">Одобрено</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="media">Медиа ({filteredMedia.length})</TabsTrigger>
              <TabsTrigger value="qa">Q&A ({filteredQA.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="media" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="photo">Фото</SelectItem>
                    <SelectItem value="video">Видео</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredMedia.map((asset) => (
                  <Card key={asset.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            {asset.type === 'photo' ? (
                              <Image className="w-8 h-8" />
                            ) : (
                              <Video className="w-8 h-8" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {asset.listing.make} {asset.listing.model} {asset.listing.year}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {asset.type === 'photo' ? 'Фотография' : 'Видео'} #{asset.order_index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(asset.created_at).toLocaleString('ru-RU')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(asset.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAsset(asset)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Проверить
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Модерация медиа</DialogTitle>
                                <DialogDescription>
                                  Проверьте медиа и выберите действие
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                  {asset.type === 'photo' ? (
                                    <Image className="w-16 h-16" />
                                  ) : (
                                    <Video className="w-16 h-16" />
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Причина действия</label>
                                  <Textarea
                                    placeholder="Укажите причину..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleMediaAction(asset.id, 'reject')}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Отклонить
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleMediaAction(asset.id, 'flag')}
                                  >
                                    <Flag className="w-4 h-4 mr-2" />
                                    Пометить
                                  </Button>
                                  <Button onClick={() => handleMediaAction(asset.id, 'approve')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Одобрить
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
              <div className="grid gap-4">
                {filteredQA.map((thread) => (
                  <Card key={thread.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">
                              {thread.listing.make} {thread.listing.model} {thread.listing.year}
                            </span>
                            {getStatusBadge(thread.status)}
                          </div>
                          <div className="mb-2">
                            <div className="text-sm font-medium">Вопрос:</div>
                            <div className="text-sm">{thread.question}</div>
                          </div>
                          {thread.answer && (
                            <div className="mb-2">
                              <div className="text-sm font-medium">Ответ:</div>
                              <div className="text-sm text-muted-foreground">{thread.answer}</div>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(thread.created_at).toLocaleString('ru-RU')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedQA(thread)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Действие
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Модерация Q&A</DialogTitle>
                                <DialogDescription>
                                  Выберите действие для данного вопроса/ответа
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Причина действия</label>
                                  <Textarea
                                    placeholder="Укажите причину..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleQAAction(thread.id, 'restore')}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Восстановить
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    onClick={() => handleQAAction(thread.id, 'pin')}
                                  >
                                    <Pin className="w-4 h-4 mr-2" />
                                    Закрепить
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleQAAction(thread.id, 'remove')}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Удалить
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaModeration;