import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

export const AuthDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Вход в Astacar
          </DialogTitle>
          <DialogDescription>
            Войдите или зарегистрируйтесь для участия в аукционах
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="email@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full">Войти</Button>
            <Button variant="outline" className="w-full">
              Забыли пароль?
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" placeholder="email@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" placeholder="+7 (999) 123-45-67" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Пароль</Label>
              <Input id="reg-password" type="password" />
            </div>
            <Button className="w-full">Зарегистрироваться</Button>
          </TabsContent>
        </Tabs>

        {/* KYC Info */}
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Верификация личности (KYC)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              После регистрации потребуется верификация через ЕСИА/Т-ID для участия в торгах
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Требуется для ставок
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};