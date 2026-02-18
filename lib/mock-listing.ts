// Mock listing data used when Apify is not configured.
// Generates realistic data from a URL so the analyze flow works end-to-end.

export interface ListingData {
  url: string;
  title: string;
  description: string;
  photoCount: number;
  photoCaptions: string[];
  amenities: string[];
  price: { amount: number | null; currency: string; period: string };
  rating: number;
  reviewCount: number;
  reviewSample: string[];
  propertyType: string;
  location: { city: string; area: string; country: string };
  host: { name: string; superhost: boolean; responseRate: string };
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export function getMockListingData(url: string): ListingData {
  // Extract a room ID from the URL if possible, to vary mock data
  const idMatch = url.match(/rooms\/(\d+)/);
  const roomId = idMatch ? parseInt(idMatch[1], 10) : 12345678;
  const seed = roomId % 5;

  const variants: ListingData[] = [
    {
      url,
      title: "Appartamento luminoso nel cuore di Roma",
      description:
        "Benvenuti nel nostro accogliente appartamento nel cuore di Roma! A pochi passi dal Colosseo e dai Fori Imperiali. L'appartamento è stato recentemente ristrutturato e dispone di tutti i comfort. La zona è servita da mezzi pubblici e ricca di ristoranti e negozi. Check-in autonomo con serratura elettronica.",
      photoCount: 12,
      photoCaptions: ["Soggiorno", "", "", "Bagno", "", "", "", "", "", "", "", ""],
      amenities: [
        "WiFi",
        "Cucina",
        "Lavatrice",
        "Aria condizionata",
        "Riscaldamento",
        "TV",
        "Ferro da stiro",
        "Asciugacapelli",
      ],
      price: { amount: 89, currency: "EUR", period: "notte" },
      rating: 4.3,
      reviewCount: 28,
      reviewSample: [
        "Posizione ottima ma l'appartamento era un po' rumoroso di notte.",
        "Pulito e ben organizzato. Host gentilissimo!",
        "Buon rapporto qualità-prezzo per la zona.",
      ],
      propertyType: "Appartamento intero",
      location: { city: "Roma", area: "Monti", country: "Italia" },
      host: { name: "Marco", superhost: false, responseRate: "85%" },
      guests: 4,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
    },
    {
      url,
      title: "Casa a Firenze",
      description:
        "Casa a Firenze, in zona tranquilla. Vicino al centro. Parcheggio disponibile.",
      photoCount: 6,
      photoCaptions: ["", "", "", "", "", ""],
      amenities: ["WiFi", "Cucina", "Riscaldamento", "Parcheggio"],
      price: { amount: 110, currency: "EUR", period: "notte" },
      rating: 4.0,
      reviewCount: 12,
      reviewSample: [
        "La casa è carina ma la descrizione non corrisponde del tutto.",
        "Posizione comoda per visitare la città.",
      ],
      propertyType: "Casa intera",
      location: { city: "Firenze", area: "Oltrarno", country: "Italia" },
      host: { name: "Giulia", superhost: false, responseRate: "72%" },
      guests: 6,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
    },
    {
      url,
      title: "✨ Luxury Loft with Panoramic View - Duomo - Fast WiFi - Netflix",
      description:
        "Benvenuti nel nostro loft di design con vista mozzafiato sul Duomo di Milano!\n\n🏠 LO SPAZIO\nIl loft è stato completamente ristrutturato nel 2023 con materiali di pregio. Open space con cucina a vista, zona living e camera da letto soppalcata.\n\n📍 LA ZONA\nSiamo nel cuore di Milano, a 2 minuti a piedi dal Duomo. Metro Duomo a 200m. Zona ricca di ristoranti, bar e shopping.\n\n🔑 CHECK-IN\nCheck-in autonomo 24/7 con smart lock.\n\n⭐ SERVIZI\nWiFi ultraveloce 300Mbps, Netflix, Nespresso, set di cortesia premium, biancheria di lusso.\n\nNon vediamo l'ora di ospitarvi! Prenotate subito, le date si riempiono velocemente! 🏃",
      photoCount: 32,
      photoCaptions: [
        "Soggiorno",
        "Vista Duomo",
        "Camera",
        "Bagno",
        "Cucina",
        "Dettaglio arredo",
        "Ingresso",
        "Vista notturna",
      ],
      amenities: [
        "WiFi veloce",
        "Cucina attrezzata",
        "Lavatrice",
        "Asciugatrice",
        "Aria condizionata",
        "Riscaldamento",
        "Smart TV con Netflix",
        "Ferro da stiro",
        "Asciugacapelli",
        "Set cortesia",
        "Nespresso",
        "Check-in autonomo",
        "Ascensore",
        "Workspace dedicato",
        "Biancheria premium",
      ],
      price: { amount: 155, currency: "EUR", period: "notte" },
      rating: 4.89,
      reviewCount: 147,
      reviewSample: [
        "Appartamento incredibile! La vista è spettacolare. Tutto perfetto.",
        "Host super disponibile, posto curatissimo in ogni dettaglio.",
        "Best place we've stayed in Milan. Highly recommend!",
        "Posizione imbattibile e loft meraviglioso. Torneremo sicuramente.",
      ],
      propertyType: "Loft intero",
      location: { city: "Milano", area: "Centro Duomo", country: "Italia" },
      host: { name: "Alessandro", superhost: true, responseRate: "99%" },
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
    {
      url,
      title: "Stanza privata a Napoli - economica",
      description:
        "Stanza in appartamento condiviso. Bagno condiviso. Vicino alla stazione.",
      photoCount: 4,
      photoCaptions: ["", "", "", ""],
      amenities: ["WiFi", "Riscaldamento"],
      price: { amount: 25, currency: "EUR", period: "notte" },
      rating: 3.8,
      reviewCount: 5,
      reviewSample: ["Economico ma la pulizia poteva essere migliore."],
      propertyType: "Stanza privata",
      location: { city: "Napoli", area: "Piazza Garibaldi", country: "Italia" },
      host: { name: "Antonio", superhost: false, responseRate: "60%" },
      guests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
    {
      url,
      title: "Villa con piscina in Toscana - Chianti",
      description:
        "Splendida villa immersa nelle colline del Chianti con piscina privata e giardino. Ideale per famiglie e gruppi. A 30 minuti da Firenze e Siena. La villa dispone di ampi spazi interni ed esterni, barbecue e parcheggio privato. Perfetta per una vacanza rilassante nella campagna toscana.",
      photoCount: 22,
      photoCaptions: ["Vista piscina", "", "Soggiorno", "", "Camera", "", "Giardino"],
      amenities: [
        "WiFi",
        "Cucina",
        "Lavatrice",
        "Aria condizionata",
        "Riscaldamento",
        "TV",
        "Piscina privata",
        "Giardino",
        "Barbecue",
        "Parcheggio privato",
        "Asciugacapelli",
        "Ferro da stiro",
      ],
      price: { amount: 280, currency: "EUR", period: "notte" },
      rating: 4.7,
      reviewCount: 64,
      reviewSample: [
        "Villa fantastica, la piscina è meravigliosa! Bambini felicissimi.",
        "Location da sogno. Consigliamo vivamente!",
        "Tutto come descritto. L'host è molto attento e disponibile.",
      ],
      propertyType: "Villa intera",
      location: { city: "Greve in Chianti", area: "Chianti", country: "Italia" },
      host: { name: "Francesca", superhost: true, responseRate: "98%" },
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
    },
  ];

  return variants[seed];
}
