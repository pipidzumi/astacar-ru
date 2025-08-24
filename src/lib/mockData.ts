import bmwImage from "@/assets/car-bmw-m3.jpg";

export interface ListingData {
  id: string;
  status: "draft" | "moderation" | "live" | "finished" | "cancelled";
  schedule: {
    startAt: string;
    endAt: string;
    serverTime: string;
  };
  pricing: {
    startPrice: number;
    reservePrice: number | null;
    buyNowPrice: number | null;
    currentPrice: number;
    minBidStep: number;
  };
  meta: {
    noReserve: boolean;
    location: string;
    sellerId: string;
    sellerRating: number;
    sellerHistoryCount: number;
    winnerId: string | null;
  };
  vehicle: {
    title: string;
    vin: string;
    make: string;
    model: string;
    trim: string;
    year: number;
    mileage: number;
    engine: string;
    transmission: string;
    drivetrain: string;
    color: string;
    ownersCount: number;
    documents: {
      titleType: "pts" | "epts";
      liens: boolean;
      restrictions: boolean;
    };
  };
  media: {
    photos: Array<{
      url: string;
      alt: string;
      order: number;
    }>;
    videos: Array<{
      url: string;
      type: string;
      poster?: string;
    }>;
  };
  inspection: {
    inspectedAt: string;
    expertId: string;
    expertName: string;
    checklist: {
      bodyPaint: {
        status: "good" | "warning" | "critical";
        panels: Array<{
          name: string;
          thickness: number;
          status: "good" | "warning" | "critical";
        }>;
      };
      powertrain: {
        status: "good" | "warning" | "critical";
        obdCodes: string[];
        notes: string;
      };
      suspension: {
        status: "good" | "warning" | "critical";
        notes: string;
      };
      brakes: {
        status: "good" | "warning" | "critical";
        frontPads: number;
        rearPads: number;
        notes: string;
      };
      tires: Array<{
        position: string;
        dot: string;
        treadDepth: number;
        status: "good" | "warning" | "critical";
      }>;
      interior: {
        status: "good" | "warning" | "critical";
        notes: string;
      };
      electronics: {
        status: "good" | "warning" | "critical";
        notes: string;
      };
    };
    legal: {
      titleStatus: "clean" | "issues";
      encumbrances: boolean;
      notes: string;
    };
    expertSummary: string;
  };
  bidding: {
    myDepositStatus: "none" | "holding" | "released" | "captured";
    myMaxAutobid: number | null;
    myIsOutbid: boolean;
    bidHistory: Array<{
      id: string;
      maskedBidderId: string;
      amount: number;
      placedAt: string;
      isWinning: boolean;
    }>;
  };
  qa: {
    questions: Array<{
      id: string;
      authorMasked: string;
      createdAt: string;
      text: string;
      answers: Array<{
        authorRole: "expert" | "moderator";
        createdAt: string;
        text: string;
      }>;
    }>;
  };
  policy: {
    antiSnipingMinutes: number;
    depositPolicy: {
      type: "fixed" | "percent";
      amount?: number;
      percent?: number;
    };
    disputeWindowHours: number;
  };
}

export const mockListingData: ListingData = {
  id: "1",
  status: "live",
  schedule: {
    startAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    serverTime: new Date().toISOString(),
  },
  pricing: {
    startPrice: 3800000,
    reservePrice: 4000000,
    buyNowPrice: 5200000,
    currentPrice: 4200000,
    minBidStep: 25000,
  },
  meta: {
    noReserve: false,
    location: "Москва",
    sellerId: "seller123",
    sellerRating: 4.8,
    sellerHistoryCount: 12,
    winnerId: null,
  },
  vehicle: {
    title: "BMW M3 Competition",
    vin: "WBS8M9C0*E5*****",
    make: "BMW",
    model: "M3",
    trim: "Competition",
    year: 2022,
    mileage: 15000,
    engine: "3.0L Twin Turbo I6",
    transmission: "8-ступенчатая автоматическая",
    drivetrain: "Задний привод",
    color: "Alpine White",
    ownersCount: 1,
    documents: {
      titleType: "pts",
      liens: false,
      restrictions: false,
    },
  },
  media: {
    photos: [
      { url: bmwImage, alt: "BMW M3 Competition - общий вид", order: 1 },
      { url: bmwImage, alt: "BMW M3 Competition - салон", order: 2 },
      { url: bmwImage, alt: "BMW M3 Competition - двигатель", order: 3 },
      { url: bmwImage, alt: "BMW M3 Competition - колеса", order: 4 },
    ],
    videos: [
      {
        url: "/videos/cold-start.mp4",
        type: "mp4",
        poster: bmwImage,
      },
    ],
  },
  inspection: {
    inspectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expertId: "expert123",
    expertName: "Александр Петров",
    checklist: {
      bodyPaint: {
        status: "good",
        panels: [
          { name: "Капот", thickness: 120, status: "good" },
          { name: "Крыша", thickness: 115, status: "good" },
          { name: "Левая дверь", thickness: 130, status: "warning" },
          { name: "Правая дверь", thickness: 125, status: "good" },
        ],
      },
      powertrain: {
        status: "good",
        obdCodes: [],
        notes: "Двигатель работает ровно, без посторонних звуков",
      },
      suspension: {
        status: "good",
        notes: "Подвеска в отличном состоянии",
      },
      brakes: {
        status: "good",
        frontPads: 80,
        rearPads: 85,
        notes: "Тормозные колодки в хорошем состоянии",
      },
      tires: [
        { position: "Передняя левая", dot: "2322", treadDepth: 6.5, status: "good" },
        { position: "Передняя правая", dot: "2322", treadDepth: 6.2, status: "good" },
        { position: "Задняя левая", dot: "2322", treadDepth: 5.8, status: "good" },
        { position: "Задняя правая", dot: "2322", treadDepth: 5.9, status: "good" },
      ],
      interior: {
        status: "good",
        notes: "Салон в отличном состоянии, незначительные следы использования",
      },
      electronics: {
        status: "good",
        notes: "Все системы функционируют исправно",
      },
    },
    legal: {
      titleStatus: "clean",
      encumbrances: false,
      notes: "Документы в порядке, обременений нет",
    },
    expertSummary: "Автомобиль в отличном техническом состоянии. Небольшая локальная подкраска на левой двери не влияет на общее состояние. Рекомендую к покупке.",
  },
  bidding: {
    myDepositStatus: "none",
    myMaxAutobid: null,
    myIsOutbid: false,
    bidHistory: [
      {
        id: "bid1",
        maskedBidderId: "Участник №8",
        amount: 4200000,
        placedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isWinning: true,
      },
      {
        id: "bid2", 
        maskedBidderId: "Участник №3",
        amount: 4175000,
        placedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isWinning: false,
      },
      {
        id: "bid3",
        maskedBidderId: "Участник №8", 
        amount: 4150000,
        placedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isWinning: false,
      },
    ],
  },
  qa: {
    questions: [
      {
        id: "q1",
        authorMasked: "Участник №5",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        text: "Была ли машина в ДТП?",
        answers: [
          {
            authorRole: "expert",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            text: "По результатам экспертизы следов ДТП не обнаружено. Автомобиль не был в серьёзных авариях.",
          },
        ],
      },
      {
        id: "q2",
        authorMasked: "Участник №12",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        text: "Какое состояние шин?",
        answers: [
          {
            authorRole: "expert", 
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            text: "Шины в хорошем состоянии, остаток протектора 5.8-6.5 мм. Равномерный износ, без повреждений.",
          },
        ],
      },
    ],
  },
  policy: {
    antiSnipingMinutes: 10,
    depositPolicy: {
      type: "fixed",
      amount: 100000,
    },
    disputeWindowHours: 72,
  },
};