export const DEFAULT_SCRAP_ITEMS = [
  { id: 'paper-news', name: 'Newspaper', hindiName: 'अखबार (Akhbaar)', category: 'paper', rate: 14, unit: 'kg', trend: '+₹1.00', trendType: 'up', minWeight: '5 kg', description: 'Clean, dry daily newspapers and newsprint.', co2SavedPerKg: 1.8, waterSavedPerKg: 26, treesSavedPerKg: 0.017 },
  { id: 'paper-gatta', name: 'Corrugated Cardboard', hindiName: 'गत्ता (Gatta / Carton)', category: 'paper', rate: 10, unit: 'kg', trend: 'Stable', trendType: 'stable', minWeight: '5 kg', description: 'Packaging boxes, delivery cartons, brown cardboard.', co2SavedPerKg: 1.4, waterSavedPerKg: 20, treesSavedPerKg: 0.012 },
  { id: 'paper-office', name: 'Office White Paper', hindiName: 'सफेद कागज़ (Office White Paper)', category: 'paper', rate: 15, unit: 'kg', trend: '+₹0.50', trendType: 'up', minWeight: '5 kg', description: 'A4 sheets, documents, printouts, notebooks.', co2SavedPerKg: 2.1, waterSavedPerKg: 30, treesSavedPerKg: 0.02 },
  { id: 'paper-books', name: 'Old Books & Magazines', hindiName: 'किताबें व पत्रिकाएं (Books/Magazines)', category: 'paper', rate: 12, unit: 'kg', trend: 'Stable', trendType: 'stable', minWeight: '5 kg', description: 'Textbooks, guidebooks, glossy periodicals.', co2SavedPerKg: 1.6, waterSavedPerKg: 22, treesSavedPerKg: 0.015 },
  { id: 'plastic-pet', name: 'PET Water Bottles', hindiName: 'पीईटी प्लास्टिक बोतलें (PET Bottles)', category: 'plastic', rate: 18, unit: 'kg', trend: '+₹1.50', trendType: 'up', minWeight: '3 kg', description: 'Clear beverage bottles, mineral water bottles.', co2SavedPerKg: 2.5, waterSavedPerKg: 40, treesSavedPerKg: 0.005 },
  { id: 'plastic-hard', name: 'Mixed Hard Plastic', hindiName: 'कड़क प्लास्टिक (Hard Plastic/Buckets)', category: 'plastic', rate: 12, unit: 'kg', trend: '-₹0.50', trendType: 'down', minWeight: '5 kg', description: 'Broken buckets, plastic mugs, chairs, crates.', co2SavedPerKg: 2.0, waterSavedPerKg: 35, treesSavedPerKg: 0.004 },
  { id: 'plastic-hdpe', name: 'HDPE Cans & Barrels', hindiName: 'एचडीपीई डिब्बे / कैन (HDPE Cans)', category: 'plastic', rate: 22, unit: 'kg', trend: '+₹2.00', trendType: 'up', minWeight: '4 kg', description: 'Detergent bottles, motor oil cans, plastic jerrycans.', co2SavedPerKg: 2.8, waterSavedPerKg: 45, treesSavedPerKg: 0.006 },
  { id: 'plastic-polythene', name: 'Clean Polythene & Film', hindiName: 'पॉलीथीन / पन्नी (Polythene)', category: 'plastic', rate: 8, unit: 'kg', trend: 'Stable', trendType: 'stable', minWeight: '5 kg', description: 'Bubble wrap, shopping bags, stretch wrap.', co2SavedPerKg: 1.5, waterSavedPerKg: 25, treesSavedPerKg: 0.003 },
  { id: 'metal-iron', name: 'Iron / Scrap Steel', hindiName: 'लोहा (Loha / Iron)', category: 'metal', rate: 32, unit: 'kg', trend: '+₹1.00', trendType: 'up', minWeight: '10 kg', description: 'TMT rods, angles, grills, pipes, rusted iron.', co2SavedPerKg: 3.5, waterSavedPerKg: 50, treesSavedPerKg: 0.01 },
  { id: 'metal-copper', name: 'Pure Copper Wire', hindiName: 'तांबा (Tamba / Copper)', category: 'metal', rate: 430, unit: 'kg', trend: '+₹12.00', trendType: 'up', minWeight: '1 kg', description: 'Stripped electric wires, copper pipes, motor winding.', co2SavedPerKg: 8.2, waterSavedPerKg: 120, treesSavedPerKg: 0.04 },
  { id: 'metal-brass', name: 'Brass / Peetal', hindiName: 'पीतल (Peetal / Brass)', category: 'metal', rate: 315, unit: 'kg', trend: '+₹5.00', trendType: 'up', minWeight: '1 kg', description: 'Brass utensils, water taps, decorative figurines.', co2SavedPerKg: 6.4, waterSavedPerKg: 95, treesSavedPerKg: 0.03 },
  { id: 'metal-aluminium', name: 'Aluminium Scrap', hindiName: 'एल्युमिनियम (Aluminium)', category: 'metal', rate: 115, unit: 'kg', trend: '+₹2.00', trendType: 'up', minWeight: '2 kg', description: 'Aluminium vessels, beverage cans, window frames.', co2SavedPerKg: 9.0, waterSavedPerKg: 140, treesSavedPerKg: 0.035 },
  { id: 'metal-steel', name: 'Stainless Steel (Bartan)', hindiName: 'स्टील बर्तन (Stainless Steel)', category: 'metal', rate: 45, unit: 'kg', trend: 'Stable', trendType: 'stable', minWeight: '3 kg', description: 'Steel plates, cutlery, kitchen sinks, utensils.', co2SavedPerKg: 4.2, waterSavedPerKg: 60, treesSavedPerKg: 0.012 },
  { id: 'ewaste-ac', name: 'Split / Window AC (1.5 Ton)', hindiName: 'पुराना एसी (Air Conditioner)', category: 'ewaste', rate: 2850, unit: 'unit', trend: '+₹50.00', trendType: 'up', minWeight: '1 unit', description: 'Complete indoor + outdoor unit with copper coil intact.', co2SavedPerKg: 18.0, waterSavedPerKg: 300, treesSavedPerKg: 0.15 },
  { id: 'ewaste-laptop', name: 'Old Laptop (Dead/Working)', hindiName: 'पुराना लैपटॉप (Old Laptop)', category: 'ewaste', rate: 450, unit: 'unit', trend: 'Stable', trendType: 'stable', minWeight: '1 unit', description: 'Any brand laptop with battery and charger.', co2SavedPerKg: 12.0, waterSavedPerKg: 180, treesSavedPerKg: 0.08 },
  { id: 'ewaste-fridge', name: 'Refrigerator (Single/Double Door)', hindiName: 'फ्रिज (Refrigerator)', category: 'ewaste', rate: 950, unit: 'unit', trend: '+₹25.00', trendType: 'up', minWeight: '1 unit', description: 'Any brand fridge with compressor included.', co2SavedPerKg: 22.0, waterSavedPerKg: 350, treesSavedPerKg: 0.18 },
  { id: 'ewaste-washing', name: 'Washing Machine', hindiName: 'वॉशिंग मशीन (Washing Machine)', category: 'ewaste', rate: 750, unit: 'unit', trend: 'Stable', trendType: 'stable', minWeight: '1 unit', description: 'Semi or fully automatic washing machine.', co2SavedPerKg: 16.0, waterSavedPerKg: 220, treesSavedPerKg: 0.12 },
  { id: 'ewaste-microwave', name: 'Microwave / OTG', hindiName: 'माइक्रोवेव (Microwave)', category: 'ewaste', rate: 350, unit: 'unit', trend: 'Stable', trendType: 'stable', minWeight: '1 unit', description: 'Standard domestic microwave oven.', co2SavedPerKg: 8.0, waterSavedPerKg: 110, treesSavedPerKg: 0.05 },
  { id: 'battery-inverter', name: 'Inverter Battery (Lead-Acid)', hindiName: 'इन्वर्टर बैटरी (Lead-Acid Battery)', category: 'battery', rate: 92, unit: 'kg', trend: '+₹2.00', trendType: 'up', minWeight: '15 kg', description: '150Ah - 220Ah tall tubular or flat inverter batteries.', co2SavedPerKg: 14.5, waterSavedPerKg: 190, treesSavedPerKg: 0.1 },
  { id: 'battery-bike', name: 'Scrap 2-Wheeler (Scooter/Bike)', hindiName: 'पुरानी बाइक / स्कूटी (2-Wheeler)', category: 'battery', rate: 3500, unit: 'unit', trend: '+₹100.00', trendType: 'up', minWeight: '1 unit', description: 'RTO deregistered or end-of-life vehicle for recycling.', co2SavedPerKg: 65.0, waterSavedPerKg: 850, treesSavedPerKg: 0.45 },
  { id: 'battery-cycle', name: 'Bicycle Scrap', hindiName: 'पुरानी साइकिल (Bicycle Scrap)', category: 'battery', rate: 350, unit: 'unit', trend: 'Stable', trendType: 'stable', minWeight: '1 unit', description: 'Kids or adult steel bicycles in any condition.', co2SavedPerKg: 15.0, waterSavedPerKg: 160, treesSavedPerKg: 0.08 }
];

export const DEFAULT_PARTNERS = [
  {
    id: 'kw-1',
    name: 'Ramu Kabadwala',
    businessName: 'Green Recyclers Pvt Ltd',
    phone: '+91 98102 34567',
    rating: 4.9,
    reviewsCount: 410,
    totalPickups: 1680,
    distanceKm: 0.8,
    locality: 'Indirapuram / Sector 62',
    city: 'Delhi NCR',
    coords: [28.6385, 77.3710],
    vehicle: 'Electric Loader (DL-1E-9021)',
    vehicleReg: 'DL-1E-9021',
    badge: 'Top Rated Executive',
    digitalScaleVerified: true,
    kycVerified: true,
    upiEnabled: true,
    status: 'en_route',
    etaMinutes: 12
  },
  {
    id: 'kw-2',
    name: 'Suresh Kumar',
    businessName: 'EcoSeva Circular Depot',
    phone: '+91 98765 43210',
    rating: 4.8,
    reviewsCount: 325,
    totalPickups: 1120,
    distanceKm: 1.6,
    locality: 'Sector 43, Gurgaon',
    city: 'Gurugram',
    coords: [28.4595, 77.0266],
    vehicle: 'Electric Tempo (HR-26-4411)',
    vehicleReg: 'HR-26-4411',
    badge: 'Certified Scale',
    digitalScaleVerified: true,
    kycVerified: true,
    upiEnabled: true,
    status: 'available',
    etaMinutes: 20
  },
  {
    id: 'kw-5',
    name: 'Jignesh Patel',
    businessName: 'Sabarmati Clean Recyclers',
    phone: '+91 98980 12345',
    rating: 4.95,
    reviewsCount: 520,
    totalPickups: 2450,
    distanceKm: 0.9,
    locality: 'Prahlad Nagar & SG Highway',
    city: 'Ahmedabad',
    coords: [23.0135, 72.5125],
    vehicle: 'Electric E-Rickshaw (GJ-01-EA-5521)',
    vehicleReg: 'GJ-01-EA-5521',
    badge: 'Star Collector',
    digitalScaleVerified: true,
    kycVerified: true,
    upiEnabled: true,
    status: 'available',
    etaMinutes: 10
  }
];

export const DEFAULT_MARKETPLACE_ITEMS = [
  // 1. Almirah / Wardrobe (User requested)
  {
    id: 'mkt-almira-1',
    title: 'Solid Teak Wood 3-Door Almirah with Locker & Full Mirror',
    description: 'Heavy solid teak wood wardrobe in rich walnut polish. Features internal hanger space, 4 deep shelves, lockable jewelry drawer, and full-length dressing mirror. Flawless hinges and keys included.',
    category: 'furniture',
    subcategory: 'almirah',
    price: 4800,
    originalPrice: 18000,
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'],
    city: 'Delhi NCR',
    locality: 'Indirapuram, Sector 62',
    seller: {
      id: 'usr-seller-1',
      name: 'Rohan Verma',
      phone: '+91 98112 34567',
      whatsapp: '919811234567',
      email: 'rohan.v@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Hot Deal'
  },
  // 2. Air Conditioner (AC) (User requested)
  {
    id: 'mkt-ac-1',
    title: 'Voltas 1.5 Ton 5-Star Inverter Split AC (100% Copper)',
    description: 'Dual inverter compressor with super chill mode. Complete set with indoor wall unit, outdoor condenser, remote control, and copper pipes. Maintained with regular authorized service.',
    category: 'appliances',
    subcategory: 'ac',
    price: 12500,
    originalPrice: 38000,
    condition: 'like_new',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'],
    city: 'Delhi NCR',
    locality: 'Sector 18, Noida',
    seller: {
      id: 'usr-seller-2',
      name: 'Meera Saxena',
      phone: '+91 98711 55678',
      whatsapp: '919871155678',
      email: 'meera.saxena@outlook.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Tested & Verified'
  },
  // 3. Dining Table (User requested)
  {
    id: 'mkt-dining-1',
    title: '6-Seater Solid Sheesham Wood Dining Table with Cushioned Chairs',
    description: 'Rich honey-finish pure Sheesham wood dining set with tempered 8mm protective glass top. Comes with 6 sturdy matching chairs with comfortable high-density beige fabric cushions.',
    category: 'furniture',
    subcategory: 'dining-table',
    price: 6900,
    originalPrice: 24000,
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80'],
    city: 'Ahmedabad',
    locality: 'Prahlad Nagar, SG Highway',
    seller: {
      id: 'usr-seller-3',
      name: 'Parthib Shah',
      phone: '+91 98250 88990',
      whatsapp: '919825088990',
      email: 'parthib.s@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Artisan Wood'
  },
  // 4. Study Table (User requested)
  {
    id: 'mkt-study-1',
    title: 'Ergonomic Wooden Study Table with Multi-Shelf Bookshelf & Drawers',
    description: 'Spacious study/work-from-home desk with wire management grommet, 2 smooth gliding lockable stationery drawers, and built-in vertical book racks. Perfect for students and professionals.',
    category: 'furniture',
    subcategory: 'study-table',
    price: 1850,
    originalPrice: 6500,
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'],
    city: 'Delhi NCR',
    locality: 'Amrapali Village, Indirapuram',
    seller: {
      id: 'usr-seller-4',
      name: 'Ananya Roy',
      phone: '+91 99100 44321',
      whatsapp: '919910044321',
      email: 'ananya.roy@yahoo.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Popular'
  },
  // 5. Sofa Set (User requested)
  {
    id: 'mkt-sofa-1',
    title: 'L-Shaped 5-Seater Modern Fabric Sofa with 4 Throw Pillows',
    description: 'Charcoal grey water-resistant linen fabric sofa. High resilience 40-density foam base for supreme back support. Frame made of treated solid sal wood. Barely 1 year old.',
    category: 'furniture',
    subcategory: 'sofa',
    price: 7500,
    originalPrice: 28000,
    condition: 'like_new',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'],
    city: 'Gurugram',
    locality: 'DLF Phase 2, Cyber City',
    seller: {
      id: 'usr-seller-5',
      name: 'Vikram Chopra',
      phone: '+91 98188 77665',
      whatsapp: '919818877665',
      email: 'vikram.c@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Steal Price'
  },
  // 6. Bed (Double Bed / Storage Bed) (User requested)
  {
    id: 'mkt-bed-1',
    title: 'King Size Engineered Wood Bed with Hydraulic Box Storage (78x72)',
    description: 'Sturdy king size bed in dark walnut finish with easy-lift hydraulic storage mechanism. Enormous under-bed storage space for blankets and luggage. Headboard has built-in night reading shelves.',
    category: 'furniture',
    subcategory: 'bed',
    price: 8200,
    originalPrice: 26000,
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'],
    city: 'Delhi NCR',
    locality: 'Vasundhara, Ghaziabad',
    seller: {
      id: 'usr-seller-6',
      name: 'Sunita Mehra',
      phone: '+91 98101 22334',
      whatsapp: '919810122334',
      email: 'sunita.mehra@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Hydraulic Storage'
  },
  // 7. Mattress (User requested)
  {
    id: 'mkt-mattress-1',
    title: 'Orthopedic Memory Foam & Coir Queen Size Mattress (6-Inch Thick)',
    description: 'Dual-comfort queen bed mattress (78x60 inches). One side firm for orthopedic spine support, other side soft breathable memory foam with removable zippered knitted cotton cover. Spotless clean.',
    category: 'furniture',
    subcategory: 'mattress',
    price: 3200,
    originalPrice: 12000,
    condition: 'excellent',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'],
    city: 'Bengaluru',
    locality: 'Koramangala, 4th Block',
    seller: {
      id: 'usr-seller-7',
      name: 'Karthik Rao',
      phone: '+91 98450 11223',
      whatsapp: '919845011223',
      email: 'karthik.rao@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Sanitized'
  },
  // 8. Bicycle / Cycle (User requested)
  {
    id: 'mkt-cycle-1',
    title: 'Hero Sprint Pro 21-Speed Mountain Gear Bicycle (Dual Disc Brakes)',
    description: 'Lightweight alloy hardtail MTB with Shimano Tourney 21-speed gears, front suspension lock-out fork, and front/rear mechanical disc brakes. New tires and newly tuned chain. Selling because moving cities.',
    category: 'cycles',
    subcategory: 'cycle',
    price: 3600,
    originalPrice: 14500,
    condition: 'like_new',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80'],
    city: 'Ahmedabad',
    locality: 'Bopal & Ambli Road',
    seller: {
      id: 'usr-seller-8',
      name: 'Aakash Dave',
      phone: '+91 97270 99887',
      whatsapp: '919727099887',
      email: 'aakash.dave@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: '21-Speed Shimano'
  },
  // 9. Old Bicycle / Roadster Cycle (User requested)
  {
    id: 'mkt-cycle-2',
    title: 'Atlas Heavy Duty Classic Road Bicycle with Carrier & Stand',
    description: 'Traditional solid steel frame roadster cycle with rear reinforced parcel carrier, full chain cover, Dynamo headlamp, and bell. Smooth rolling, recently serviced and oiled.',
    category: 'cycles',
    subcategory: 'cycle',
    price: 1400,
    originalPrice: 4800,
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80'],
    city: 'Delhi NCR',
    locality: 'Laxmi Nagar, East Delhi',
    seller: {
      id: 'usr-seller-9',
      name: 'Gopal Yadav',
      phone: '+91 98110 55443',
      whatsapp: '919811055443',
      email: 'gopal.y@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Classic Vintage'
  },
  // 10. Table (Center / Coffee Table) (User requested)
  {
    id: 'mkt-table-1',
    title: 'Rustic Teak Wood Center Coffee Table with Bottom Storage Magazine Rack',
    description: 'Solid teakwood coffee table with dark honey grain polish and lower tier slatted magazine shelf. Rounded child-safe edges. Perfect centerpiece for living room couch.',
    category: 'furniture',
    subcategory: 'table',
    price: 1350,
    originalPrice: 5200,
    condition: 'good',
    images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=600&q=80'],
    city: 'Mumbai',
    locality: 'Hill Road, Bandra West',
    seller: {
      id: 'usr-seller-10',
      name: 'Farhan Merchant',
      phone: '+91 98200 33445',
      whatsapp: '919820033445',
      email: 'farhan.m@gmail.com',
      isVerified: true
    },
    itemType: 'second_hand',
    status: 'available',
    badge: 'Quick Deal'
  },

  // 11-14: Upcycled Eco Products from circular workshop
  {
    id: 'prod-1',
    title: 'Handmade Eco Kraft Journal & Seed Pen Set',
    category: 'upcycled',
    subcategory: 'stationery',
    price: 349,
    originalPrice: 499,
    condition: 'brand_new',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    description: '100% made from segregated post-consumer discarded office papers and cardboard. Comes with plantable seed pencils that sprout into tulsi and marigold plants.',
    materialsUsed: '2.5 kg Recycled Paper Scrap',
    co2Saved: '4.2 kg CO₂',
    badge: 'Bestseller',
    city: 'Delhi NCR',
    locality: 'KabadCollect Circular Studio',
    seller: {
      id: 'artisan-coop-1',
      name: 'KabadCollect Eco Crafts',
      phone: '+91 98100 00001',
      whatsapp: '919810000001',
      email: 'store@kabadcollect.com',
      isVerified: true
    },
    itemType: 'upcycled',
    status: 'available'
  },
  {
    id: 'prod-2',
    title: 'Upcycled Scrap Metal Geometric Table Lamp',
    category: 'upcycled',
    subcategory: 'decor',
    price: 1299,
    originalPrice: 1899,
    condition: 'brand_new',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'],
    description: 'Crafted by local metal artisans using discarded iron pipes, brass nuts, and bicycle chain rings gathered from local scrap yards.',
    materialsUsed: '3.8 kg Reclaimed Scrap Iron',
    co2Saved: '11.5 kg CO₂',
    badge: 'Artisan Craft',
    city: 'Ahmedabad',
    locality: 'Sabarmati Artisans Hub',
    seller: {
      id: 'artisan-coop-2',
      name: 'Metal Upcycle Collective',
      phone: '+91 98250 00002',
      whatsapp: '919825000002',
      email: 'store@kabadcollect.com',
      isVerified: true
    },
    itemType: 'upcycled',
    status: 'available'
  },
  {
    id: 'prod-3',
    title: 'Recycled Ocean Plastic Waterproof Backpack (22L)',
    category: 'upcycled',
    subcategory: 'bags',
    price: 1899,
    originalPrice: 2699,
    condition: 'brand_new',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    description: 'Woven using durable rPET yarn made from 38 recycled plastic bottles collected across coastal city drives.',
    materialsUsed: '38 PET Bottles',
    co2Saved: '7.8 kg CO₂',
    badge: 'Zero Waste',
    city: 'Mumbai',
    locality: 'Coastal Cleanup Lab',
    seller: {
      id: 'artisan-coop-3',
      name: 'Ocean Plastic Works',
      phone: '+91 98200 00003',
      whatsapp: '919820000003',
      email: 'store@kabadcollect.com',
      isVerified: true
    },
    itemType: 'upcycled',
    status: 'available'
  },
  {
    id: 'prod-4',
    title: 'Upcycled Automobile Tyre Garden Planter / Ottoman',
    category: 'upcycled',
    subcategory: 'outdoor',
    price: 899,
    originalPrice: 1299,
    condition: 'brand_new',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80'],
    description: 'Cleaned, treated, and braided with natural jute rope to turn non-biodegradable discarded car tyres into chic weather-proof seating and planters.',
    materialsUsed: '1 Discarded Car Tyre + Jute',
    co2Saved: '18.4 kg CO₂',
    badge: 'Trending',
    city: 'Delhi NCR',
    locality: 'Green Wheel Studios',
    seller: {
      id: 'artisan-coop-4',
      name: 'Circular Living Co.',
      phone: '+91 98100 00004',
      whatsapp: '919810000004',
      email: 'store@kabadcollect.com',
      isVerified: true
    },
    itemType: 'upcycled',
    status: 'available'
  }
];

export const DEFAULT_ORDERS = [
  {
    id: 'KC-7729',
    userId: 'usr-customer-1',
    customer: {
      name: 'Aarav Sharma',
      phone: '+91 98100 23456',
      email: 'aarav@kabadcollect.com',
      address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Delhi NCR - 201014',
      city: 'Delhi NCR'
    },
    categories: ['paper', 'plastics'],
    estimatedWeight: '20-50 kg',
    itemsWeighed: [
      { name: 'Old Newspapers (Akhbaar)', weight: '14.5 kg', rate: '₹14/kg', amount: 203 },
      { name: 'Cardboard Boxes (Gatta)', weight: '18.0 kg', rate: '₹10/kg', amount: 180 },
      { name: 'Mixed Plastic Bottles', weight: '6.2 kg', rate: '₹12/kg', amount: 74.4 }
    ],
    totalPayout: 457.4,
    scheduledDate: 'Today',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'en_route',
    kabadwala: {
      id: 'kw-1',
      name: 'Ramu Kabadwala (Green Recyclers)',
      phone: '+91 98102 34567',
      rating: 4.9,
      vehicle: 'Electric Loader (DL-1E-9021)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    upiId: 'aarav.sharma@okhdfcbank',
    createdAt: new Date().toISOString()
  },
  {
    id: 'KC-7681',
    userId: 'usr-customer-1',
    customer: {
      name: 'Aarav Sharma',
      phone: '+91 98100 23456',
      email: 'aarav@kabadcollect.com',
      address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Delhi NCR - 201014',
      city: 'Delhi NCR'
    },
    categories: ['metal', 'ewaste'],
    estimatedWeight: '15-25 kg',
    itemsWeighed: [
      { name: 'Iron & Steel Scrap', weight: '12.0 kg', rate: '₹28/kg', amount: 336 },
      { name: 'Obsolete PC Tower / Motherboard', weight: '1 pc', rate: '₹450/pc', amount: 450 }
    ],
    totalPayout: 786,
    scheduledDate: 'Yesterday',
    timeSlot: '03:00 PM - 05:00 PM',
    status: 'completed',
    kabadwala: {
      id: 'kw-2',
      name: 'Suresh Kumar (EcoSeva)',
      phone: '+91 98765 43210',
      rating: 4.8,
      vehicle: 'Electric Tempo (DL-2E-4411)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    upiId: 'aarav.sharma@okhdfcbank',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const DEFAULT_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Vikram Singhania',
    email: 'admin@kabadcollect.com',
    phone: '+91 98111 22334',
    role: 'admin',
    city: 'Delhi NCR',
    totalEarned: 12500,
    totalRecycledKg: 850
  },
  {
    id: 'usr-customer-1',
    name: 'Aarav Sharma',
    email: 'aarav@kabadcollect.com',
    phone: '+91 98100 23456',
    role: 'user',
    city: 'Delhi NCR',
    address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Delhi NCR - 201014',
    totalEarned: 1243.4,
    totalRecycledKg: 78.5
  },
  {
    id: 'usr-seller-1',
    name: 'Priya Verma',
    email: 'priya.verma@gmail.com',
    phone: '+91 98102 99881',
    role: 'user',
    city: 'Delhi NCR',
    totalEarned: 18500,
    totalRecycledKg: 120
  }
];

