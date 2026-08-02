import {
  Wheat, Fish, Egg, Milk, Nut, Bean, Flame, Shell,
} from "lucide-react";

export const ALLERGENS = [
  { id: "gluten", label: "Gluten", icon: Wheat, color: "#C98A5E" },
  { id: "crustaceos", label: "Crustáceos", icon: Shell, color: "#4FAEC9" },
  { id: "huevo", label: "Huevo", icon: Egg, color: "#E0A63A" },
  { id: "pescado", label: "Pescado", icon: Fish, color: "#4A78B0" },
  { id: "lacteos", label: "Lácteos", icon: Milk, color: "#B9AFD9" },
  { id: "frutos_secos", label: "Frutos secos", icon: Nut, color: "#8A6E4B" },
  { id: "soja", label: "Soja", icon: Bean, color: "#6FA772" },
  { id: "picante", label: "Picante", icon: Flame, color: "#C9563F" },
];

export const LANGS = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export const PLANS = [
  {
    id: "basico",
    name: "Básico",
    price: 19,
    tagline: "Para un bar o restaurante con una carta",
    features: [
      "1 carta digital con QR propio",
      "Hasta 6 categorías",
      "Fotos y alérgenos ilimitados",
      "1 idioma (español)",
      "QR listo para imprimir",
    ],
    limits: { maxCategories: 6, maxLangs: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 35,
    tagline: "El más elegido por bares y restaurantes",
    highlight: true,
    features: [
      "Todo lo del plan Básico",
      "Categorías y platos ilimitados",
      "Hasta 3 idiomas (traducción manual)",
      "Color e identidad de marca propios",
      "Cambios y soporte prioritario",
    ],
    limits: { maxCategories: Infinity, maxLangs: 3 },
  },
  {
    id: "premium",
    name: "Premium",
    price: 59,
    tagline: "Para grupos con varios locales",
    features: [
      "Todo lo del plan Pro",
      "Hasta 5 cartas / locales en una cuenta",
      "Idiomas ilimitados",
      "Menús especiales (grupos, comuniones, eventos)",
      "Línea directa de soporte",
    ],
    limits: { maxCategories: Infinity, maxLangs: Infinity },
  },
];

export const SETUP_FEE = 79;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyRestaurant = (slug, ownerUid) => ({
  slug,
  ownerUid,
  name: "Mi Restaurante",
  tagline: "Cocina de mercado",
  phone: "",
  address: "",
  cover: "",
  accent: "#7A2331",
  plan: "basico",
  categories: [
    {
      id: uid(),
      name: "Entrantes",
      items: [
        {
          id: uid(),
          name: "Ensaladilla rusa castiza",
          description: "Con ventresca de bonito y piparras",
          price: "15,50",
          photo: "",
          allergens: ["huevo", "pescado", "gluten"],
          translations: {},
        },
      ],
    },
  ],
});
