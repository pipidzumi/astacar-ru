import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  FileText
} from 'lucide-react';

interface Deposit {
  id: string;
  user_id: string;
  listing_id: string;
  amount: number;
  status: 'hold' | 'captured' | 'released' | 'refunded';
  created_at: string;
  updated_at: string;
  provider_ref?: string;
  listing: {
    make: string;
    model: string;
    year: number;
    current_price: number;
  };
  user: {
    full_name: string;
    email: string;
  };
}

interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  vehicle_amount: number;
  fee_amount: number;
  status: 'initiated' | 'escrow' | 'paid' | 'released' | 'refunded';
  created_at: string;
  updated_at: string;
  escrow_ref?: string;
  listing: {
    make: string;
    model: string;
    year: number;
  };
  buyer: {
    full_name: string;
    email: string;
  };
  seller: {
    full_name: string;
    email: string;
  };
}

interface FinancialSummary {
  total_deposits_held: number;
  total_deposits_captured: number;
  pending_payouts: number;
  pending_refunds: number;
  monthly_revenue: number;
  escrow_balance: number;
}

const Finances: React.FC = () => {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    total_deposits_held: 0,
    total_deposits_captured: 0,
    pending_payouts: 0,
    pending_refunds: 0,
    monthly_revenue: 0,
    escrow_balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      // Load deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          *,
          listings!inner(make, model, year, current_price, vehicles!inner(make, model, year)),
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          listings!inner(make, model, year, vehicles!inner(make, model, year)),
          buyer:profiles!buyer_id(full_name, email),
          seller:profiles!seller_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Calculate summary
      const held = depositsData?.filter(d => d.status === 'hold').reduce((sum, d) => sum + d.amount, 0) || 0;
      const captured = depositsData?.filter(d => d.status === 'captured').reduce((sum, d) => sum + d.amount, 0) || 0;
      const pendingPayouts = transactionsData?.filter(t => t.status === 'escrow').reduce((sum, t) => sum + t.vehicle_amount, 0) || 0;
      const pendingRefunds = transactionsData?.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.vehicle_amount, 0) || 0;

      setDeposits(depositsData || []);
      setTransactions(transactionsData || []);
      setSummary({
        total_deposits_held: held,
        total_deposits_captured: captured,
        pending_payouts: pendingPayouts,
        pending_refunds: pendingRefunds,
        monthly_revenue: captured + (transactionsData?.reduce((sum, t) => sum + t.fee_amount, 0) || 0),
        escrow_balance: pendingPayouts
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить финансовые данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('finance-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDepositAction = async (depositIds: string[], action: 'hold' | 'capture' | 'release') => {
    if (!actionReason.trim()) {
      toast({
        title: "Требуется причина",
        description: "Укажите причину действия",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-deposits-action', {
        body: {
          deposit_ids: depositIds,
          action,
          reason: actionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Действие выполнено",
        description: `Депозиты обработаны: ${action}`
      });

      setActionReason('');
      setSelectedItems([]);
      loadData();
    } catch (error) {
      console.error('Error processing deposits:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать депозиты",
        variant: "destructive"
      });
    }
  };

  const handleTransactionAction = async (transactionId: string, action: 'release' | 'refund' | 'retry') => {
    if (!actionReason.trim()) {
      toast({
        title: "Требуется причина",
        description: "Укажите причину действия",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-escrow-action', {
        body: {
          transaction_id: transactionId,
          action,
          reason: actionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Действие выполнено",
        description: `Транзакция обработана: ${action}`
      });

      setActionReason('');
      loadData();
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать транзакцию",
        variant: "destructive"
      });
    }
  };

  const exportData = async (type: 'deposits' | 'transactions') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-export-finance', {
        body: { type }
      });

      if (error) throw error;

      // Create and download file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Экспорт завершен",
        description: "Файл загружен"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      hold: { variant: 'secondary' as const, text: 'Заблокировано', icon: Lock },
      captured: { variant: 'destructive' as const, text: 'Списано', icon: ArrowDownCircle },
      released: { variant: 'default' as const, text: 'Освобождено', icon: Unlock },
      refunded: { variant: 'outline' as const, text: 'Возвращено', icon: ArrowUpCircle },
      initiated: { variant: 'secondary' as const, text: 'Инициировано', icon: Clock },
      escrow: { variant: 'secondary' as const, text: 'В эскроу', icon: Lock },
      paid: { variant: 'default' as const, text: 'Оплачено', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant={config?.variant || 'secondary'}>
        <Icon className="w-3 h-3 mr-1" />
        {config?.text || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const filteredDeposits = deposits.filter(deposit => {
    const statusMatch = statusFilter === 'all' || deposit.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      deposit.listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.listing.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const filteredTransactions = transactions.filter(transaction => {
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      transaction.listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.listing.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.seller.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
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
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground">Управление депозитами, эскроу и выплатами</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Заблокировано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_deposits_held)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Списано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_deposits_captured)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              К выплате
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pending_payouts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              К возврату
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pending_refunds)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Доходы месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.monthly_revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Эскроу баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.escrow_balance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Финансовые операции</CardTitle>
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
                  <SelectItem value="hold">Заблокировано</SelectItem>
                  <SelectItem value="captured">Списано</SelectItem>
                  <SelectItem value="released">Освобождено</SelectItem>
                  <SelectItem value="refunded">Возвращено</SelectItem>
                  <SelectItem value="escrow">В эскроу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposits">Депозиты ({filteredDeposits.length})</TabsTrigger>
              <TabsTrigger value="transactions">Транзакции ({filteredTransactions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposits" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedItems.length > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Выбрано: {selectedItems.length}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Массовое действие
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Массовое действие с депозитами</DialogTitle>
                            <DialogDescription>
                              Выберите действие для {selectedItems.length} депозитов
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
                                onClick={() => handleDepositAction(selectedItems, 'release')}
                              >
                                <Unlock className="w-4 h-4 mr-2" />
                                Освободить
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDepositAction(selectedItems, 'capture')}
                              >
                                <ArrowDownCircle className="w-4 h-4 mr-2" />
                                Списать
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => exportData('deposits')}>
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredDeposits.map((deposit) => (
                  <Card key={deposit.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedItems.includes(deposit.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, deposit.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== deposit.id));
                              }
                            }}
                          />
                          <div>
                            <div className="font-medium">
                              {deposit.listing.make} {deposit.listing.model} {deposit.listing.year}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {deposit.user.full_name} ({deposit.user.email})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(deposit.created_at).toLocaleString('ru-RU')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(deposit.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              Текущая цена: {formatCurrency(deposit.listing.current_price)}
                            </div>
                          </div>
                          {getStatusBadge(deposit.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => exportData('transactions')}>
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-2">
                            {transaction.listing.make} {transaction.listing.model} {transaction.listing.year}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Покупатель:</div>
                              <div>{transaction.buyer.full_name}</div>
                              <div className="text-xs text-muted-foreground">{transaction.buyer.email}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Продавец:</div>
                              <div>{transaction.seller.full_name}</div>
                              <div className="text-xs text-muted-foreground">{transaction.seller.email}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(transaction.created_at).toLocaleString('ru-RU')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(transaction.vehicle_amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              Комиссия: {formatCurrency(transaction.fee_amount)}
                            </div>
                            {transaction.escrow_ref && (
                              <div className="text-xs text-muted-foreground">
                                Эскроу: {transaction.escrow_ref}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {getStatusBadge(transaction.status)}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Действие
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Действие с транзакцией</DialogTitle>
                                  <DialogDescription>
                                    Выберите действие для данной транзакции
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
                                      onClick={() => handleTransactionAction(transaction.id, 'retry')}
                                    >
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Повторить
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleTransactionAction(transaction.id, 'refund')}
                                    >
                                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                                      Возврат
                                    </Button>
                                    <Button
                                      onClick={() => handleTransactionAction(transaction.id, 'release')}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Выплатить
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
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

export default Finances;