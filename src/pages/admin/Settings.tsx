import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Settings as SettingsIcon,
  DollarSign,
  Clock,
  Image,
  Shield,
  Palette,
  Globe,
  Key,
  Save,
  RefreshCw,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  XCircle
} from 'lucide-react';

interface PlatformSettings {
  auction: {
    minBidStep: number;
    antiSnipingMinutes: number;
    defaultDuration: number;
    closureCadence: number;
    reserveEnabled: boolean;
    buyNowEnabled: boolean;
    depositPolicy: {
      type: 'fixed' | 'percentage';
      amount: number;
    };
    feePolicy: {
      buyer: { type: 'fixed' | 'percentage'; amount: number };
      seller: { type: 'fixed' | 'percentage'; amount: number };
    };
  };
  content: {
    mediaMinimums: {
      photos: number;
      videos: number;
      requiredAngles: string[];
    };
    piiDefaults: {
      maskPlates: boolean;
      maskDocs: boolean;
    };
    qaRules: {
      maxQuestions: number;
      autoModerate: boolean;
    };
  };
  integrations: {
    payment: {
      provider: string;
      testMode: boolean;
    };
    kyc: {
      provider: string;
      strictMode: boolean;
    };
    storage: {
      provider: string;
      maxFileSize: number;
    };
    messaging: {
      provider: string;
      templates: Record<string, string>;
    };
  };
  catalogs: {
    brands: string[];
    regions: string[];
    tags: string[];
  };
  featureFlags: Record<string, { enabled: boolean; rollout: number }>;
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>({
    auction: {
      minBidStep: 1000,
      antiSnipingMinutes: 5,
      defaultDuration: 7 * 24,
      closureCadence: 2,
      reserveEnabled: true,
      buyNowEnabled: true,
      depositPolicy: { type: 'percentage', amount: 10 },
      feePolicy: {
        buyer: { type: 'percentage', amount: 5 },
        seller: { type: 'percentage', amount: 3 }
      }
    },
    content: {
      mediaMinimums: {
        photos: 40,
        videos: 2,
        requiredAngles: ['front', 'rear', 'interior', 'engine', 'wheels']
      },
      piiDefaults: {
        maskPlates: true,
        maskDocs: true
      },
      qaRules: {
        maxQuestions: 10,
        autoModerate: true
      }
    },
    integrations: {
      payment: {
        provider: 'stripe',
        testMode: false
      },
      kyc: {
        provider: 'sumsub',
        strictMode: true
      },
      storage: {
        provider: 'supabase',
        maxFileSize: 50 * 1024 * 1024
      },
      messaging: {
        provider: 'sendgrid',
        templates: {}
      }
    },
    catalogs: {
      brands: ['BMW', 'Mercedes', 'Porsche', 'Audi', 'Toyota'],
      regions: ['Москва', 'СПб', 'Екатеринбург', 'Краснодар'],
      tags: ['Премиум', 'Без резерва', 'Редкая', 'Эксклюзив']
    },
    featureFlags: {
      newBiddingInterface: { enabled: true, rollout: 100 },
      enhancedInspections: { enabled: false, rollout: 0 },
      aiModeration: { enabled: false, rollout: 25 }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-settings-get');
      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить настройки",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section: string, data: any) => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('admin-settings-update', {
        body: {
          section,
          data,
          reason: `Обновление секции ${section}`
        }
      });

      if (error) throw error;

      toast({
        title: "Настройки сохранены",
        description: `Секция "${section}" обновлена`
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service: string) => {
    setTestingConnection(service);
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-integration', {
        body: { service }
      });

      if (error) throw error;

      toast({
        title: "Соединение успешно",
        description: `Сервис ${service} работает корректно`,
        variant: data.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Ошибка соединения",
        description: `Не удалось подключиться к ${service}`,
        variant: "destructive"
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const updateFeatureFlag = async (flag: string, enabled: boolean, rollout: number) => {
    const updatedFlags = {
      ...settings.featureFlags,
      [flag]: { enabled, rollout }
    };
    
    setSettings({
      ...settings,
      featureFlags: updatedFlags
    });

    await saveSettings('featureFlags', updatedFlags);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} МБ`;
  };

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
          <h1 className="text-3xl font-bold">Настройки платформы</h1>
          <p className="text-muted-foreground">Конфигурация аукционов, контента и интеграций</p>
        </div>
        <Button onClick={loadSettings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </Button>
      </div>

      <Tabs defaultValue="auction" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="auction">Аукционы</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          <TabsTrigger value="catalogs">Справочники</TabsTrigger>
          <TabsTrigger value="features">Функции</TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Экономика аукционов
              </CardTitle>
              <CardDescription>
                Настройки ставок, депозитов и комиссий
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBidStep">Минимальный шаг ставки (₽)</Label>
                  <Input
                    id="minBidStep"
                    type="number"
                    value={settings.auction.minBidStep}
                    onChange={(e) => setSettings({
                      ...settings,
                      auction: { ...settings.auction, minBidStep: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="antiSnipingMinutes">Анти-снайпинг (мин)</Label>
                  <Input
                    id="antiSnipingMinutes"
                    type="number"
                    value={settings.auction.antiSnipingMinutes}
                    onChange={(e) => setSettings({
                      ...settings,
                      auction: { ...settings.auction, antiSnipingMinutes: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Политика депозитов</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Тип депозита</Label>
                    <Select 
                      value={settings.auction.depositPolicy.type}
                      onValueChange={(value: 'fixed' | 'percentage') => 
                        setSettings({
                          ...settings,
                          auction: { 
                            ...settings.auction, 
                            depositPolicy: { ...settings.auction.depositPolicy, type: value }
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Фиксированная сумма</SelectItem>
                        <SelectItem value="percentage">Процент от ставки</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      Размер ({settings.auction.depositPolicy.type === 'fixed' ? '₽' : '%'})
                    </Label>
                    <Input
                      type="number"
                      value={settings.auction.depositPolicy.amount}
                      onChange={(e) => setSettings({
                        ...settings,
                        auction: { 
                          ...settings.auction, 
                          depositPolicy: { ...settings.auction.depositPolicy, amount: parseFloat(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Политика комиссий</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Комиссия покупателя</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Select 
                        value={settings.auction.feePolicy.buyer.type}
                        onValueChange={(value: 'fixed' | 'percentage') => 
                          setSettings({
                            ...settings,
                            auction: { 
                              ...settings.auction, 
                              feePolicy: { 
                                ...settings.auction.feePolicy,
                                buyer: { ...settings.auction.feePolicy.buyer, type: value }
                              }
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Фикс. (₽)</SelectItem>
                          <SelectItem value="percentage">Проц. (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.auction.feePolicy.buyer.amount}
                        onChange={(e) => setSettings({
                          ...settings,
                          auction: { 
                            ...settings.auction, 
                            feePolicy: { 
                              ...settings.auction.feePolicy,
                              buyer: { ...settings.auction.feePolicy.buyer, amount: parseFloat(e.target.value) }
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Комиссия продавца</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Select 
                        value={settings.auction.feePolicy.seller.type}
                        onValueChange={(value: 'fixed' | 'percentage') => 
                          setSettings({
                            ...settings,
                            auction: { 
                              ...settings.auction, 
                              feePolicy: { 
                                ...settings.auction.feePolicy,
                                seller: { ...settings.auction.feePolicy.seller, type: value }
                              }
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Фикс. (₽)</SelectItem>
                          <SelectItem value="percentage">Проц. (%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.auction.feePolicy.seller.amount}
                        onChange={(e) => setSettings({
                          ...settings,
                          auction: { 
                            ...settings.auction, 
                            feePolicy: { 
                              ...settings.auction.feePolicy,
                              seller: { ...settings.auction.feePolicy.seller, amount: parseFloat(e.target.value) }
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Резервная цена</div>
                  <div className="text-sm text-muted-foreground">Разрешить установку резервной цены</div>
                </div>
                <Switch 
                  checked={settings.auction.reserveEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    auction: { ...settings.auction, reserveEnabled: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Немедленная покупка</div>
                  <div className="text-sm text-muted-foreground">Разрешить покупку без аукциона</div>
                </div>
                <Switch 
                  checked={settings.auction.buyNowEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    auction: { ...settings.auction, buyNowEnabled: checked }
                  })}
                />
              </div>

              <Button onClick={() => saveSettings('auction', settings.auction)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить настройки аукционов'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Требования к контенту
              </CardTitle>
              <CardDescription>
                Минимумы медиа и правила модерации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Минимальные требования к медиа</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPhotos">Минимум фотографий</Label>
                    <Input
                      id="minPhotos"
                      type="number"
                      value={settings.content.mediaMinimums.photos}
                      onChange={(e) => setSettings({
                        ...settings,
                        content: { 
                          ...settings.content, 
                          mediaMinimums: { 
                            ...settings.content.mediaMinimums, 
                            photos: parseInt(e.target.value) 
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minVideos">Минимум видео</Label>
                    <Input
                      id="minVideos"
                      type="number"
                      value={settings.content.mediaMinimums.videos}
                      onChange={(e) => setSettings({
                        ...settings,
                        content: { 
                          ...settings.content, 
                          mediaMinimums: { 
                            ...settings.content.mediaMinimums, 
                            videos: parseInt(e.target.value) 
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Обязательные ракурсы</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['front', 'rear', 'interior', 'engine', 'wheels', 'dashboard'].map((angle) => (
                    <Badge 
                      key={angle}
                      variant={settings.content.mediaMinimums.requiredAngles.includes(angle) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const angles = settings.content.mediaMinimums.requiredAngles;
                        const updated = angles.includes(angle) 
                          ? angles.filter(a => a !== angle)
                          : [...angles, angle];
                        
                        setSettings({
                          ...settings,
                          content: { 
                            ...settings.content, 
                            mediaMinimums: { 
                              ...settings.content.mediaMinimums, 
                              requiredAngles: updated 
                            }
                          }
                        });
                      }}
                    >
                      {angle}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Настройки приватности</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Автоматическое скрытие номеров</div>
                      <div className="text-sm text-muted-foreground">Маскировать номерные знаки на фото</div>
                    </div>
                    <Switch 
                      checked={settings.content.piiDefaults.maskPlates}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        content: { 
                          ...settings.content, 
                          piiDefaults: { ...settings.content.piiDefaults, maskPlates: checked }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Автоматическое скрытие документов</div>
                      <div className="text-sm text-muted-foreground">Маскировать персональные данные в документах</div>
                    </div>
                    <Switch 
                      checked={settings.content.piiDefaults.maskDocs}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        content: { 
                          ...settings.content, 
                          piiDefaults: { ...settings.content.piiDefaults, maskDocs: checked }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveSettings('content', settings.content)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить настройки контента'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Платежи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Провайдер</Label>
                    <Select 
                      value={settings.integrations.payment.provider}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        integrations: { 
                          ...settings.integrations, 
                          payment: { ...settings.integrations.payment, provider: value }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="yandex">Яндекс.Касса</SelectItem>
                        <SelectItem value="tinkoff">Тинькофф</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => testConnection('payment')}
                      disabled={testingConnection === 'payment'}
                    >
                      {testingConnection === 'payment' ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Тест
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Тестовый режим</div>
                    <div className="text-sm text-muted-foreground">Использовать sandbox API</div>
                  </div>
                  <Switch 
                    checked={settings.integrations.payment.testMode}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: { 
                        ...settings.integrations, 
                        payment: { ...settings.integrations.payment, testMode: checked }
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  KYC верификация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Провайдер</Label>
                    <Select 
                      value={settings.integrations.kyc.provider}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        integrations: { 
                          ...settings.integrations, 
                          kyc: { ...settings.integrations.kyc, provider: value }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sumsub">Sum&Substance</SelectItem>
                        <SelectItem value="jumio">Jumio</SelectItem>
                        <SelectItem value="onfido">Onfido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => testConnection('kyc')}
                      disabled={testingConnection === 'kyc'}
                    >
                      {testingConnection === 'kyc' ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Тест
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Строгий режим</div>
                    <div className="text-sm text-muted-foreground">Повышенные требования к документам</div>
                  </div>
                  <Switch 
                    checked={settings.integrations.kyc.strictMode}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: { 
                        ...settings.integrations, 
                        kyc: { ...settings.integrations.kyc, strictMode: checked }
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="catalogs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Справочники
              </CardTitle>
              <CardDescription>
                Управление брендами, регионами и тегами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Бренды автомобилей</Label>
                <Textarea
                  placeholder="Каждый бренд на новой строке..."
                  value={settings.catalogs.brands.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    catalogs: { 
                      ...settings.catalogs, 
                      brands: e.target.value.split('\n').filter(b => b.trim())
                    }
                  })}
                  rows={5}
                />
              </div>
              
              <div>
                <Label>Регионы</Label>
                <Textarea
                  placeholder="Каждый регион на новой строке..."
                  value={settings.catalogs.regions.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    catalogs: { 
                      ...settings.catalogs, 
                      regions: e.target.value.split('\n').filter(r => r.trim())
                    }
                  })}
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Теги</Label>
                <Textarea
                  placeholder="Каждый тег на новой строке..."
                  value={settings.catalogs.tags.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    catalogs: { 
                      ...settings.catalogs, 
                      tags: e.target.value.split('\n').filter(t => t.trim())
                    }
                  })}
                  rows={3}
                />
              </div>

              <Button onClick={() => saveSettings('catalogs', settings.catalogs)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить справочники'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="w-5 h-5 mr-2" />
                Экспериментальные функции
              </CardTitle>
              <CardDescription>
                Управление функциями и A/B тестированием
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.featureFlags).map(([flag, config]) => (
                <div key={flag} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">{flag}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.enabled ? `Включена для ${config.rollout}% пользователей` : 'Отключена'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {config.enabled ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <Switch 
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateFeatureFlag(flag, checked, config.rollout)}
                      />
                    </div>
                  </div>
                  
                  {config.enabled && (
                    <div>
                      <Label>Процент пользователей (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={config.rollout}
                        onChange={(e) => updateFeatureFlag(flag, config.enabled, parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;