import { Link } from "react-router-dom";
import { Youtube, Send, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
                <div className="h-8 md:h-10" data-testid="footer-logo">
                  <svg viewBox="0 0 180 36" className="h-full w-auto text-white" aria-hidden="true">
                    <title>ASTACAR</title>
                    {/* A */}
                    <path d="M8 28L12 10L16 28H19L13 6H11L5 28H8ZM9.5 22H14.5L12 14L9.5 22Z" fill="currentColor"/>
                    {/* S */}
                    <path d="M26 14C26 12 27 10 29 10C30.5 10 31.5 11 31.5 12.5H34C34 9.5 32 7.5 29 7.5C25.5 7.5 23.5 10 23.5 14C23.5 18 25.5 20 29 20C30.5 20 31.5 19 31.5 17.5H34C34 20.5 32 22.5 29 22.5C25.5 22.5 23.5 20.5 23.5 16.5C23.5 16 23.5 15 26 14Z" fill="currentColor"/>
                    {/* T */}
                    <path d="M36 10V7.5H48V10H44V28H41V10H36Z" fill="currentColor"/>
                    {/* A */}
                    <path d="M54 28L58 10L62 28H65L59 6H57L51 28H54ZM55.5 22H60.5L58 14L55.5 22Z" fill="currentColor"/>
                    {/* C */}
                    <path d="M73 28C77 28 80 25 80 20.5H77.5C77.5 23.5 75.5 25.5 73 25.5C70 25.5 68 23 68 17.5C68 12 70 9.5 73 9.5C75.5 9.5 77.5 11.5 77.5 14.5H80C80 9.5 77 7 73 7C68 7 65.5 11 65.5 17.5C65.5 24 68 28 73 28Z" fill="currentColor"/>
                    {/* A */}
                    <path d="M87 28L91 10L95 28H98L92 6H90L84 28H87ZM88.5 22H93.5L91 14L88.5 22Z" fill="currentColor"/>
                    {/* R */}
                    <path d="M104 7.5V28H107V19.5H111L115 28H118L113.5 19C116 18.5 117.5 16.5 117.5 13.5C117.5 9.5 115 7.5 111 7.5H104ZM107 10H111C113 10 114.5 11 114.5 13.5C114.5 16 113 17 111 17H107V10Z" fill="currentColor"/>
                  </svg>
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