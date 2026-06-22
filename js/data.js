const PASSPORTS = {
  pizza: {
    id: "pizza",
    name: "Pizza Passport",
    emoji: "🍕",
    description: "Explore the DMV's best pizza spots one slice at a time.",
    color: "#c0392b",
    attributes: ["Crust", "Sauce", "Cheese", "Value"],
    available: true,
    restaurants: [
      {
        id: "pupatella-arlington",
        name: "Pupatella",
        neighborhood: "Ballston",
        city: "Arlington, VA",
        address: "5104 Wilson Blvd, Arlington, VA",
        lat: 38.8854,
        lng: -77.1013,
        difficulty: "easy",
        tags: ["neapolitan", "AVPN certified"],
        description: "Authentic Neapolitan pizza certified by the Associazione Verace Pizza Napoletana."
      },
      {
        id: "italian-store",
        name: "The Italian Store",
        neighborhood: "Lyon Village",
        city: "Arlington, VA",
        address: "3123 Lee Hwy, Arlington, VA",
        lat: 38.8936,
        lng: -77.1083,
        difficulty: "easy",
        tags: ["old school", "ny style", "local legend"],
        description: "An Arlington institution since 1980 — classic New York-style pies and Italian subs beloved by generations of NoVA families."
      },
      {
        id: "lost-dog-cafe",
        name: "Lost Dog Cafe",
        neighborhood: "Westover",
        city: "Arlington, VA",
        address: "5876 Washington Blvd, Arlington, VA",
        lat: 38.8743,
        lng: -77.1448,
        difficulty: "easy",
        tags: ["community favorite", "local chain"],
        description: "A beloved Arlington staple with creative pizza and a community mission — proceeds support local animal rescues."
      },
      {
        id: "wiseguy-ballston",
        name: "Wiseguy Pizza",
        neighborhood: "Ballston",
        city: "Arlington, VA",
        address: "4301 Wilson Blvd, Arlington, VA",
        lat: 38.8820,
        lng: -77.1126,
        difficulty: "easy",
        tags: ["ny style", "by the slice"],
        description: "New York-style slices done right — grab a fold-over slice in the heart of Ballston."
      },
      {
        id: "matchbox-merrifield",
        name: "Matchbox",
        neighborhood: "Merrifield",
        city: "Fairfax, VA",
        address: "2918 District Ave, Fairfax, VA",
        lat: 38.8708,
        lng: -77.2295,
        difficulty: "medium",
        tags: ["wood fired", "upscale casual"],
        description: "Thin-crust wood-fired pies in the Mosaic District — perfect for a date night pizza crawl."
      },
      {
        id: "orso-falls-church",
        name: "Orso Ristorante",
        neighborhood: "Falls Church",
        city: "Falls Church, VA",
        address: "298 W Broad St, Falls Church, VA",
        lat: 38.8826,
        lng: -77.1714,
        difficulty: "medium",
        tags: ["italian", "hidden gem", "wood fired"],
        description: "A cozy Falls Church gem serving rustic Italian pies from a wood-burning oven."
      },
      {
        id: "cheesetique-alexandria",
        name: "Cheesetique",
        neighborhood: "Del Ray",
        city: "Alexandria, VA",
        address: "2411 Mount Vernon Ave, Alexandria, VA",
        lat: 38.8362,
        lng: -77.0651,
        difficulty: "medium",
        tags: ["artisan", "cheese forward"],
        description: "A cheese shop and bistro in Del Ray with flatbreads and specialty pizzas built around serious cheese."
      },
      {
        id: "petes-apizza-arlington",
        name: "Pete's New Haven Style Apizza",
        neighborhood: "Courthouse",
        city: "Arlington, VA",
        address: "3017 Clarendon Blvd, Arlington, VA",
        lat: 38.8866,
        lng: -77.0944,
        difficulty: "easy",
        tags: ["new haven", "coal fired"],
        description: "Connecticut-style coal-fired apizza with a legendary char — the Arlington outpost of a DMV favorite."
      },
      {
        id: "andy-pizza-arlington",
        name: "Andy's Pizza",
        neighborhood: "Rosslyn",
        city: "Arlington, VA",
        address: "1700 N Moore St, Arlington, VA",
        lat: 38.8947,
        lng: -77.0716,
        difficulty: "easy",
        tags: ["neapolitan", "local favorite"],
        description: "Wood-fired Neapolitan pies from a beloved DMV local chain, right across the river in Rosslyn."
      },
      {
        id: "stellina-pizzeria",
        name: "Stellina Pizzeria",
        neighborhood: "Union Market",
        city: "DC",
        address: "399 Morse St NE, Washington, DC",
        lat: 38.9076,
        lng: -76.9956,
        difficulty: "medium",
        tags: ["roman", "al taglio"],
        description: "Roman-style rectangular pies sold by the slice at Union Market — worth the trip into DC."
      },
      {
        id: "2amys",
        name: "2Amys",
        neighborhood: "Cleveland Park",
        city: "DC",
        address: "3715 Macomb St NW, Washington, DC",
        lat: 38.9376,
        lng: -77.0649,
        difficulty: "hard",
        tags: ["neapolitan", "DOC certified"],
        description: "DOC-certified Neapolitan pizza in Cleveland Park — one of the DMV's most iconic pies."
      },
      {
        id: "timber-pizza",
        name: "Timber Pizza Co.",
        neighborhood: "Petworth",
        city: "DC",
        address: "809 Upshur St NW, Washington, DC",
        lat: 38.9400,
        lng: -77.0234,
        difficulty: "hard",
        tags: ["wood fired", "creative toppings"],
        description: "Creative seasonal wood-fired pies in Petworth — a DC bucket list stop."
      }
    ]
  },
  ramen: {
    id: "ramen",
    name: "Ramen Passport",
    emoji: "🍜",
    description: "Slurp your way through the DMV's best ramen bowls.",
    color: "#e67e22",
    available: false,
    restaurants: []
  },
  coffee: {
    id: "coffee",
    name: "Coffee Passport",
    emoji: "☕",
    description: "Discover the DMV's best independent coffee shops.",
    color: "#6f4e37",
    available: false,
    restaurants: []
  },
  tacos: {
    id: "tacos",
    name: "Tacos Passport",
    emoji: "🌮",
    description: "Taco crawl across the DMV.",
    color: "#27ae60",
    available: false,
    restaurants: []
  },
  matcha: {
    id: "matcha",
    name: "Matcha Passport",
    emoji: "🍵",
    description: "Explore the DMV's matcha cafés and tea houses.",
    color: "#2ecc71",
    available: false,
    restaurants: []
  },
  banhmi: {
    id: "banhmi",
    name: "Bánh Mì Passport",
    emoji: "🥖",
    description: "The best bánh mì sandwiches across the DMV.",
    color: "#f39c12",
    available: false,
    restaurants: []
  },
  icecream: {
    id: "icecream",
    name: "Ice Cream Passport",
    emoji: "🍨",
    description: "Scoop your way through DMV's best creameries.",
    color: "#9b59b6",
    available: false,
    restaurants: []
  },
  brunch: {
    id: "brunch",
    name: "Brunch Passport",
    emoji: "🍳",
    description: "The DMV's most iconic brunch spots.",
    color: "#e74c3c",
    available: false,
    restaurants: []
  }
};

const LEVELS = [
  { name: "Food Tourist", minXP: 0, icon: "🗺️" },
  { name: "Weekend Explorer", minXP: 100, icon: "🧭" },
  { name: "Neighborhood Expert", minXP: 300, icon: "📍" },
  { name: "DMV Foodie", minXP: 600, icon: "⭐" },
  { name: "DMV Legend", minXP: 1000, icon: "👑" }
];

const XP_REWARDS = {
  checkIn: 25,
  photo: 10,
  ranking: 15,
  neighborhoodComplete: 50
};
