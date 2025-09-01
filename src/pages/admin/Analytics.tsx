import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Gavel,
  DollarSign,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Award,
  AlertCircle,
  Clock
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

interface KPI {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface ChartData {
  date: string;
  value: number;
  label: string;
}

interface AnalyticsData {
  operational: {
    avgBidsPerListing: number;
    sellThroughRate: number;
    timeToFirstBid: number;
    listingsWithMultipleBids: number;
    winnerCancellationRate: number;
  };
  financial: {
    arpl: number;
    depositsHeld: number;
    depositsReleased: number;
    depositsCaptured: number;
    payoutsCompleted: number;
    refundsIssued: number;
    monthlyRevenue: number;
  };
  quality: {
    inspectionMismatchRate: number;
    avgQAResponseTime: number;
    mediaCompletenessScore: number;
    customerSatisfaction: number;
  };
  marketing: {
    catalogToDetailConversion: number;
    detailToBidConversion: number;
    notificationOpenRate: number;
    subscriptionGrowth: number;
  };
}

const Analytics: React.FC = () => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    operational: {
      avgBidsPerListing: 0,
      sellThroughRate: 0,
      timeToFirstBid: 0,
      listingsWithMultipleBids: 0,
      winnerCancellationRate: 0
    },
    financial: {
      arpl: 0,
      depositsHeld: 0,
      depositsReleased: 0,
      depositsCaptured: 0,
      payoutsCompleted: 0,
      refundsIssued: 0,
      monthlyRevenue: 0
    },
    quality: {
      inspectionMismatchRate: 0,
      avgQAResponseTime: 0,
      mediaCompletenessScore: 0,
      customerSatisfaction: 0
    },
    marketing: {
      catalogToDetailConversion: 0,
      detailToBidConversion: 0,
      notificationOpenRate: 0,
      subscriptionGrowth: 0
    }
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [regionFilter, setRegionFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, regionFilter, brandFilter]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Call analytics edge function
      const { data, error } = await supabase.functions.invoke('admin-analytics', {
        body: {
          dateRange,
          filters: {
            region: regionFilter === 'all' ? null : regionFilter,
            brand: brandFilter === 'all' ? null : brandFilter
          }
        }
      });

      if (error) throw error;

      setAnalyticsData(data.kpis);
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить аналитику",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-export-analytics', {
        body: {
          type,
          dateRange,
          filters: {
            region: regionFilter === 'all' ? null : regionFilter,
            brand: brandFilter === 'all' ? null : brandFilter
          }
        }
      });

      if (error) throw error;

      // Create and download file
      const blob = new Blob([data], { 
        type: type === 'pdf' ? 'application/pdf' : 
              type === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
              'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Отчет экспортирован",
        description: "Файл загружен"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать отчет",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} мин`;
    }
    return `${hours.toFixed(1)} ч`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const operationalKPIs: KPI[] = [
    {
      name: 'Среднее ставок/лот',
      value: analyticsData.operational.avgBidsPerListing,
      change: 12.5,
      trend: 'up',
      icon: <Gavel className="w-4 h-4" />
    },
    {
      name: 'Продаваемость',
      value: analyticsData.operational.sellThroughRate,
      change: -2.1,
      trend: 'down',
      icon: <Target className="w-4 h-4" />
    },
    {
      name: 'Время до 1й ставки',
      value: analyticsData.operational.timeToFirstBid,
      change: -15.3,
      trend: 'up',
      icon: <Award className="w-4 h-4" />
    },
    {
      name: '% лотов с 3+ ставками',
      value: analyticsData.operational.listingsWithMultipleBids,
      change: 8.7,
      trend: 'up',
      icon: <Users className="w-4 h-4" />
    }
  ];

  const financialKPIs: KPI[] = [
    {
      name: 'ARPL (средн. доход/лот)',
      value: analyticsData.financial.arpl,
      change: 18.2,
      trend: 'up',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      name: 'Доходы месяц',
      value: analyticsData.financial.monthlyRevenue,
      change: 25.4,
      trend: 'up',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      name: 'Депозиты заблок.',
      value: analyticsData.financial.depositsHeld,
      change: -5.1,
      trend: 'down',
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      name: 'Выплаты завершены',
      value: analyticsData.financial.payoutsCompleted,
      change: 15.8,
      trend: 'up',
      icon: <Award className="w-4 h-4" />
    }
  ];

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
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground">Операционные, финансовые и качественные показатели</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          <Select onValueChange={(value) => exportReport(value as 'csv' | 'xlsx' | 'pdf')}>
            <SelectTrigger className="w-32">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Экспорт" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium">Период</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Регион</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все регионы</SelectItem>
                  <SelectItem value="moscow">Москва</SelectItem>
                  <SelectItem value="spb">СПб</SelectItem>
                  <SelectItem value="regions">Регионы</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Бренд</label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все бренды</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes</SelectItem>
                  <SelectItem value="porsche">Porsche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="operational" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operational">Операционные</TabsTrigger>
          <TabsTrigger value="financial">Финансовые</TabsTrigger>
          <TabsTrigger value="quality">Качество</TabsTrigger>
          <TabsTrigger value="marketing">Маркетинг</TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {operationalKPIs.map((kpi) => (
              <Card key={kpi.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {kpi.icon}
                      <span className="text-sm font-medium">{kpi.name}</span>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {kpi.name.includes('время') ? formatTime(kpi.value) :
                       kpi.name.includes('%') ? formatPercentage(kpi.value) :
                       kpi.value.toFixed(1)}
                    </div>
                    <div className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}% к предыдущему периоду
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Динамика ставок</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Количество ставок",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialKPIs.map((kpi) => (
              <Card key={kpi.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {kpi.icon}
                      <span className="text-sm font-medium">{kpi.name}</span>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {kpi.name.includes('ARPL') || kpi.name.includes('Доходы') || kpi.name.includes('Депозиты') || kpi.name.includes('Выплаты') ?
                       formatCurrency(kpi.value) : kpi.value.toFixed(0)}
                    </div>
                    <div className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}% к предыдущему периоду
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Доходы по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Доходы",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Структура депозитов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Заблокировано:</span>
                    <span className="font-medium">{formatCurrency(analyticsData.financial.depositsHeld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Освобождено:</span>
                    <span className="font-medium">{formatCurrency(analyticsData.financial.depositsReleased)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Списано:</span>
                    <span className="font-medium">{formatCurrency(analyticsData.financial.depositsCaptured)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Несоответствия инспекции</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.quality.inspectionMismatchRate)}</div>
                  <div className="text-xs text-muted-foreground">от общего числа жалоб</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Время ответа Q&A</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatTime(analyticsData.quality.avgQAResponseTime)}</div>
                  <div className="text-xs text-muted-foreground">среднее время</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Полнота медиа</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.quality.mediaCompletenessScore)}</div>
                  <div className="text-xs text-muted-foreground">средний балл</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Удовлетворенность</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{analyticsData.quality.customerSatisfaction.toFixed(1)}/5</div>
                  <div className="text-xs text-muted-foreground">NPS после сделки</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Каталог → Детали</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.marketing.catalogToDetailConversion)}</div>
                  <div className="text-xs text-muted-foreground">конверсия</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gavel className="w-4 h-4" />
                  <span className="text-sm font-medium">Детали → Ставка</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.marketing.detailToBidConversion)}</div>
                  <div className="text-xs text-muted-foreground">конверсия</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Открытие уведомлений</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.marketing.notificationOpenRate)}</div>
                  <div className="text-xs text-muted-foreground">от отправленных</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Рост подписок</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{formatPercentage(analyticsData.marketing.subscriptionGrowth)}</div>
                  <div className="text-xs text-muted-foreground">за месяц</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;