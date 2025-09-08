import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserCheck, 
  Search, 
  DollarSign, 
  Gavel, 
  Trophy, 
  Car,
  FileText,
  Camera,
  Settings,
  TrendingUp,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  Eye
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

const HowItWorks = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const buyerSteps = [
    {
      icon: UserCheck,
      title: "Register & Verify Identity",
      description: "Create an account and complete KYC to unlock bidding. This reduces fraud and enables safe transactions for everyone."
    },
    {
      icon: Search,
      title: "Explore Listings",
      description: "Each lot includes 60+ photos, videos, and a structured inspection report covering body/paint thickness, OBD, suspension/brakes, tires, interior, electronics, and legal status."
    },
    {
      icon: DollarSign,
      title: "Pay Refundable Deposit",
      description: "A small deposit per listing confirms serious intent. It's fully refunded if your bid doesn't win."
    },
    {
      icon: Gavel,
      title: "Place Bids with Fair Rules",
      description: "Defined increments with anti-sniping protection. If a bid arrives in the final minutes, the auction extends automatically so everyone has a fair chance."
    },
    {
      icon: Trophy,
      title: "Win & Finalize",
      description: "If you win and reserve is met, proceed to payment via secure escrow-like flow. Receive invoices and instructions in your profile."
    },
    {
      icon: Car,
      title: "Collect Your Car",
      description: "Pick up yourself or use logistics partners. Documents handled per instructions with a simple checklist to complete handover."
    }
  ];

  const sellerSteps = [
    {
      icon: FileText,
      title: "Submit Your Car",
      description: "Fill out a short form with make/model/VIN/photos for quick pre-screening. Get guidance on reserve vs no-reserve options."
    },
    {
      icon: Camera,
      title: "Expert Inspection",
      description: "Schedule an inspection where we capture 60+ photos, videos, and a detailed report covering paint thickness, OBD, suspension, tires, interior, and legal status verification."
    },
    {
      icon: Settings,
      title: "Set Auction Parameters",
      description: "Choose start price (typically 50% of market estimate), optional reserve, optional Buy Now, and schedule your publication window."
    },
    {
      icon: TrendingUp,
      title: "Auction Goes Live",
      description: "We handle moderation and presentation with public Q&A and expert answers. Anti-sniping ensures fair price discovery."
    },
    {
      icon: CreditCard,
      title: "Deal & Payout",
      description: "Buyer pays via secure flow. After handover confirmation and dispute window expires, funds are released to you."
    },
    {
      icon: Truck,
      title: "Optional Logistics",
      description: "Delivery partners available for transport if needed. We can coordinate the entire logistics process."
    }
  ];

  const faqs = [
    {
      id: "deposit-refund",
      question: "Is the deposit refundable?",
      answer: "Yes, deposits are fully refundable if you don't win the auction. If you win but cancel without valid reason, the deposit may be forfeited."
    },
    {
      id: "car-mismatch",
      question: "What if the car doesn't match the report?",
      answer: "We have a dispute window after auction completion. If the car significantly differs from our inspection report, you can open a dispute for resolution."
    },
    {
      id: "anti-sniping",
      question: "What is anti-sniping and how does it work?",
      answer: "Anti-sniping automatically extends auctions when bids are placed in the final minutes, ensuring everyone has a fair chance to bid and preventing last-second wins."
    },
    {
      id: "reserve-not-met",
      question: "What happens if reserve isn't met?",
      answer: "If the reserve price isn't reached, the seller can choose to accept the highest bid or relist the car. No transaction occurs automatically."
    },
    {
      id: "payment-collection",
      question: "How long do I have to pay and collect the car?",
      answer: "Winners typically have 7 days to complete payment and 14 days to collect the vehicle. Specific terms are outlined in each auction listing."
    },
    {
      id: "reserve-selling",
      question: "Can I sell with a reserve? Pros/cons?",
      answer: "Yes, you can set a reserve price. Pros: protects against low sales. Cons: may reduce bidding activity. No-reserve auctions often achieve higher final prices."
    }
  ];

  const differentiators = [
    {
      icon: Shield,
      title: "Verified People (KYC)",
      description: "Lower fraud through identity verification"
    },
    {
      icon: Eye,
      title: "Expert Inspection Media",
      description: "Confidence without multiple in-person visits"
    },
    {
      icon: CheckCircle,
      title: "Fair Auction Mechanics",
      description: "Anti-sniping and reserve transparency"
    },
    {
      icon: CreditCard,
      title: "Safe Payments",
      description: "Clear post-auction steps and optional logistics"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Buy and sell used cars safely with transparent auctions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Expert inspection media with 60+ photos and videos, KYC verification, refundable deposits, 
              anti-sniping protection, and secure escrow-like payments ensure safe transactions for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/")}>
                Browse Live Auctions
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/sell")}>
                Submit Your Car
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How Buying Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Buying Works</h2>
              <p className="text-lg text-muted-foreground">Simple steps to find and win your perfect car</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerSteps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button onClick={() => navigate("/")} size="lg">
                Start Browsing Auctions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How Selling Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Selling Works</h2>
              <p className="text-lg text-muted-foreground">Get the best price for your car with our transparent process</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerSteps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button onClick={() => navigate("/sell")} size="lg" variant="secondary">
                Submit Your Car
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Astacar Apart */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Sets Astacar Apart</h2>
              <p className="text-lg text-muted-foreground">
                Why thousands choose Astacar for safe, transparent car auctions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about buying and selling on Astacar
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id}>
                  <Collapsible>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between w-full">
                          <CardTitle className="text-left text-lg">{faq.question}</CardTitle>
                          <ChevronDown 
                            className={`h-5 w-5 transition-transform ${
                              expandedFaq === faq.id ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Support */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Astacar</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of satisfied buyers and sellers who trust Astacar for transparent, 
              secure car auctions. Growing user base with high sell-through rates and fair pricing.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link to="/" className="text-primary hover:underline">Buyer Guide</Link>
              <Link to="/sell" className="text-primary hover:underline">Seller Guide</Link>
              <Link to="/" className="text-primary hover:underline">Fees & Deposits</Link>
              <Link to="/" className="text-primary hover:underline">Logistics</Link>
              <Link to="/" className="text-primary hover:underline">Support</Link>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/")}>
                Browse Live Auctions
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/sell")}>
                Submit Your Car
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;