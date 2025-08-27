import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Eye, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  CreditCard,
  FileText,
  Ban,
  Clock
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  kyc_status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    address: string | null;
    dob: string | null;
    rating: number | null;
    ban_flags: any;
  };
  deposits?: { amount: number; status: string }[];
  transactions?: { count: number }[];
  disputes?: { count: number }[];
}

const UsersKYC: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [selectedTab, kycFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('users')
        .select(`
          *,
          profile:profiles(*),
          deposits(amount, status),
          transactions(count),
          disputes(count)
        `);

      // Apply filters
      if (selectedTab === 'pending_kyc') {
        query = query.eq('kyc_status', 'pending');
      } else if (selectedTab === 'banned') {
        query = query.not('profile.ban_flags', 'is', null);
      }

      if (kycFilter !== 'all' && ['pending', 'success', 'failed', 'not_required'].includes(kycFilter)) {
        query = query.eq('kyc_status', kycFilter as any);
      }

      if (roleFilter !== 'all' && ['buyer', 'seller', 'expert', 'moderator', 'admin'].includes(roleFilter)) {
        query = query.eq('role', roleFilter as any);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKYCAction = async (userId: string, action: 'approve' | 'reject' | 'request_docs') => {
    try {
      const { error } = await supabase.functions.invoke('admin-users-kyc', {
        body: {
          user_id: userId,
          action
        }
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: `KYC ${action === 'approve' ? 'одобрен' : action === 'reject' ? 'отклонен' : 'запрошены документы'}`
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating KYC:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус KYC",
        variant: "destructive"
      });
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'unsuspend' | 'set_limit') => {
    try {
      const { error } = await supabase.functions.invoke('admin-users-action', {
        body: {
          user_id: userId,
          action
        }
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Действие выполнено"
      });

      loadUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    }
  };

  const getKYCBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Ожидает', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      approved: { label: 'Одобрен', variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { label: 'Отклонен', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      expired: { label: 'Истек', variant: 'secondary', icon: <AlertTriangle className="w-3 h-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'secondary',
      icon: <FileText className="w-3 h-3" />
    };
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Админ', variant: 'destructive' },
      moderator: { label: 'Модератор', variant: 'default' },
      seller: { label: 'Продавец', variant: 'secondary' },
      buyer: { label: 'Покупатель', variant: 'outline' },
      expert: { label: 'Эксперт', variant: 'default' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'outline' };
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getRiskLevel = (user: UserData) => {
    let riskScore = 0;
    
    // Check ban flags
    if (user.profile?.ban_flags && Object.keys(user.profile.ban_flags).length > 0) {
      riskScore += 50;
    }
    
    // Check dispute history
    const disputeCount = user.disputes?.[0]?.count || 0;
    if (disputeCount > 2) riskScore += 30;
    
    // Check transaction patterns
    const transactionCount = user.transactions?.[0]?.count || 0;
    if (transactionCount > 50) riskScore += 10;
    
    if (riskScore >= 50) return { level: 'high', label: 'Высокий', color: 'destructive' };
    if (riskScore >= 20) return { level: 'medium', label: 'Средний', color: 'secondary' };
    return { level: 'low', label: 'Низкий', color: 'outline' };
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    return searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Пользователи и KYC</h1>
          <p className="text-muted-foreground">Управление пользователями и верификация документов</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button>Пригласить модератора</Button>
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
                  placeholder="Поиск по email, имени или телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="KYC статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все KYC</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="approved">Одобрен</SelectItem>
                <SelectItem value="rejected">Отклонен</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="buyer">Покупатель</SelectItem>
                <SelectItem value="seller">Продавец</SelectItem>
                <SelectItem value="expert">Эксперт</SelectItem>
                <SelectItem value="moderator">Модератор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Все пользователи</TabsTrigger>
          <TabsTrigger value="pending_kyc">
            KYC на проверке ({users.filter(u => u.kyc_status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="high_risk">Высокий риск</TabsTrigger>
          <TabsTrigger value="banned">Заблокированные</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedTab === 'all' && 'Все пользователи'}
                {selectedTab === 'pending_kyc' && 'KYC на проверке'}
                {selectedTab === 'high_risk' && 'Пользователи с высоким риском'}
                {selectedTab === 'banned' && 'Заблокированные пользователи'}
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
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Активность</TableHead>
                      <TableHead>Регистрация</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const riskLevel = getRiskLevel(user);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.profile?.full_name || 'Не указано'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              {user.phone && (
                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell>
                            {getKYCBadge(user.kyc_status)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={riskLevel.color as any}>
                              {riskLevel.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>Сделок: {user.transactions?.[0]?.count || 0}</p>
                              <p>Депозиты: {user.deposits?.length || 0}</p>
                              <p>Диспуты: {user.disputes?.[0]?.count || 0}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog open={userDetailsDialog && selectedUser?.id === user.id} onOpenChange={setUserDetailsDialog}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Профиль пользователя</DialogTitle>
                                  </DialogHeader>
                                  {selectedUser && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium mb-2">Основная информация</h4>
                                          <div className="space-y-2 text-sm">
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Телефон:</strong> {selectedUser.phone || 'Не указан'}</p>
                                            <p><strong>Имя:</strong> {selectedUser.profile?.full_name || 'Не указано'}</p>
                                            <p><strong>Адрес:</strong> {selectedUser.profile?.address || 'Не указан'}</p>
                                            <p><strong>Рейтинг:</strong> {selectedUser.profile?.rating || 'Нет'}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">Статистика</h4>
                                          <div className="space-y-2 text-sm">
                                            <p><strong>Роль:</strong> {selectedUser.role}</p>
                                            <p><strong>KYC:</strong> {selectedUser.kyc_status}</p>
                                            <p><strong>Сделки:</strong> {selectedUser.transactions?.[0]?.count || 0}</p>
                                            <p><strong>Депозиты:</strong> {selectedUser.deposits?.length || 0}</p>
                                            <p><strong>Диспуты:</strong> {selectedUser.disputes?.[0]?.count || 0}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {selectedUser.kyc_status === 'pending' && (
                                        <div className="flex gap-2 pt-4 border-t">
                                          <Button onClick={() => handleKYCAction(selectedUser.id, 'approve')}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Одобрить KYC
                                          </Button>
                                          <Button 
                                            variant="destructive" 
                                            onClick={() => handleKYCAction(selectedUser.id, 'reject')}
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Отклонить
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            onClick={() => handleKYCAction(selectedUser.id, 'request_docs')}
                                          >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Запросить документы
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {user.kyc_status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleKYCAction(user.id, 'approve')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleKYCAction(user.id, 'reject')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                <Ban className="w-4 h-4" />
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

export default UsersKYC;