import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  Gavel,
  Image,
  Users,
  Wallet,
  MessageSquare,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  Bell,
  Search,
  User
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Панель управления',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin'
    },
    {
      id: 'listings',
      label: 'Лоты и аукционы',
      icon: <Gavel className="w-5 h-5" />,
      href: '/admin/listings',
      badge: 3,
      children: [
        { id: 'listings-queue', label: 'Очередь модерации', icon: null, href: '/admin/listings/queue' },
        { id: 'listings-live', label: 'Активные аукционы', icon: null, href: '/admin/listings/live' },
        { id: 'listings-scheduled', label: 'Запланированные', icon: null, href: '/admin/listings/scheduled' }
      ]
    },
    {
      id: 'media',
      label: 'Модерация контента',
      icon: <Image className="w-5 h-5" />,
      href: '/admin/media',
      badge: 7
    },
    {
      id: 'users',
      label: 'Пользователи и KYC',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users'
    },
    {
      id: 'finances',
      label: 'Финансы',
      icon: <Wallet className="w-5 h-5" />,
      href: '/admin/finances',
      children: [
        { id: 'bids', label: 'Ставки и депозиты', icon: null, href: '/admin/finances/bids' },
        { id: 'transactions', label: 'Транзакции', icon: null, href: '/admin/finances/transactions' },
        { id: 'disputes', label: 'Диспуты', icon: null, href: '/admin/finances/disputes' }
      ]
    },
    {
      id: 'communications',
      label: 'Уведомления',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/admin/communications'
    },
    {
      id: 'analytics',
      label: 'Аналитика',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/admin/analytics'
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings'
    },
    {
      id: 'security',
      label: 'Безопасность',
      icon: <Shield className="w-5 h-5" />,
      href: '/admin/security'
    }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        throw new Error('Пользователь не найден');
      }

      // Check if user has admin/moderator role
      if (!['admin', 'moderator', 'ops', 'finance', 'support', 'analyst'].includes(userData.role)) {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав доступа к панели администратора",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      toast({
        title: "Ошибка авторизации",
        description: "Не удалось проверить права доступа",
        variant: "destructive"
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActivePath = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'ops': return 'bg-green-100 text-green-800';
      case 'finance': return 'bg-yellow-100 text-yellow-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      case 'analyst': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h1 className="text-lg font-semibold">Astacar Admin</h1>
            <p className="text-xs text-muted-foreground">Панель управления</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={isActivePath(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
            
            {item.children && isActivePath(item.href) && (
              <div className="ml-6 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.id}
                    variant={location.pathname === child.href ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(child.href);
                      setSidebarOpen(false);
                    }}
                  >
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        {user && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                {user.role}
              </Badge>
            </div>
          </div>
        )}
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-card border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <div className="hidden md:flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Поиск..." 
                  className="bg-transparent border-0 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              {user && (
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                    {user.role}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;