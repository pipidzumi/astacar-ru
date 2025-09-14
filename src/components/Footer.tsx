import { Link } from "react-router-dom";
import { Youtube, Send, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AstacarWordmark from "@/assets/logos/astacar_logo_font_mono.svg?react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic would go here
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="relative text-white min-h-[400px]">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4B0082,#32DCFA,#00FFAF)]"></div>
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/25"></div>
      
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <Link to="/" aria-label="Astacar — home" className="inline-block">
                <div className="h-8 md:h-10 w-auto text-white" data-testid="footer-logo">
                  <AstacarWordmark className="h-full w-auto" aria-hidden="true" />
                </div>
              </Link>
              <p className="text-sm text-white/90 mt-2">
                Прозрачные C2C автоаукционы с экспертными проверками, честными торгами и безопасными платежами.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
              <a 
                href="https://vk.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="VKontakte"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="h-5 w-5 font-bold text-sm">VK</div>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Auctions Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Аукционы</h4>
            <nav className="space-y-2">
              <Link to="/auctions/live" className="block text-white/90 hover:text-white transition-colors">
                Живые аукционы
              </Link>
              <Link to="/auctions/ending-soon" className="block text-white/90 hover:text-white transition-colors">
                Заканчиваются скоро
              </Link>
              <Link to="/auctions/no-reserve" className="block text-white/90 hover:text-white transition-colors">
                Without Reserve
              </Link>
              <Link to="/results" className="block text-white/90 hover:text-white transition-colors">
                Результаты торгов
              </Link>
              <Link to="/sell" className="block text-white/90 hover:text-white transition-colors">
                Продать автомобиль
              </Link>
            </nav>
          </div>

          {/* Help & Guides Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Помощь и гайды</h4>
            <nav className="space-y-2">
              <Link to="/how-it-works" className="block text-white/90 hover:text-white transition-colors">
                Как это работает
              </Link>
              <Link to="/how-it-works#buy" className="block text-white/90 hover:text-white transition-colors">
                Гайд покупателя
              </Link>
              <Link to="/how-it-works#sell" className="block text-white/90 hover:text-white transition-colors">
                Гайд продавца
              </Link>
              <Link to="/fees" className="block text-white/90 hover:text-white transition-colors">
                Комиссии и депозиты
              </Link>
              <Link to="/inspections" className="block text-white/90 hover:text-white transition-colors">
                Экспертиза
              </Link>
              <Link to="/shipping" className="block text-white/90 hover:text-white transition-colors">
                Доставка
              </Link>
              <Link to="/support" className="block text-white/90 hover:text-white transition-colors">
                Поддержка
              </Link>
            </nav>
          </div>

          {/* Company & Legal Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Компания</h4>
            <nav className="space-y-2">
              <Link to="/why-astacar" className="block text-white/90 hover:text-white transition-colors">
                О нас
              </Link>
              <Link to="/careers" className="block text-white/90 hover:text-white transition-colors">
                Карьера
              </Link>
              <Link to="/partners" className="block text-white/90 hover:text-white transition-colors">
                Партнеры
              </Link>
              <Link to="/legal/terms" className="block text-white/90 hover:text-white transition-colors">
                Пользовательское соглашение
              </Link>
              <Link to="/legal/privacy" className="block text-white/90 hover:text-white transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/legal/cookies" className="block text-white/90 hover:text-white transition-colors">
                Файлы cookie
              </Link>
            </nav>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-md">
            <h4 className="text-lg font-semibold mb-2">Рассылка</h4>
            <p className="text-white/90 text-sm mb-4">
              Получайте уведомления о лучших лотах и заканчивающихся аукционах.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
                className="flex-1 bg-white/10 border-white/20 placeholder-white/70 text-white focus:border-white/60 focus:ring-white/20"
              />
              <Button 
                type="submit"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Подписаться
              </Button>
            </form>
            <p className="text-xs text-white/70 mt-2">
              Подписываясь, вы соглашаетесь с{" "}
              <Link to="/legal/privacy" className="underline hover:no-underline">
                политикой конфиденциальности
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-white/90 text-sm">
            © Astacar, 2025. Все права защ��щены.
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/90 hover:text-white text-sm transition-colors">
              RU
            </button>
            <span className="text-white/50">|</span>
            <button className="text-white/90 hover:text-white text-sm transition-colors">
              EN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;