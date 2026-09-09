export const INITIAL_ORDERS = [
  {
    id: 'KC-8842',
    customerName: 'Aarav Sharma',
    phone: '+91 98100 23456',
    address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Ghaziabad',
    pincode: '201014',
    scheduledSlot: 'Today, 2:00 PM - 4:00 PM',
    status: 'in_transit', // pending, assigned, in_transit, weighing, completed
    createdAt: '2026-09-07T11:30:00Z',
    categories: ['paper', 'plastic', 'metal'],
    estimatedWeight: '35-50 kg',
    estimatedAmount: 780,
    kabadwala: {
      id: 'kw-1',
      name: 'Ramesh Kumar',
      businessName: 'GreenEarth Scrap Enterprises',
      phone: '+91 98112 34567',
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      vehicle: 'E-Rickshaw (DL-5ER-8921)',
      etaMinutes: 18,
      currentLocation: 'Sector 62 Crossing (0.8 km away)'
    },
    itemsWeighed: [
      { name: 'Newspaper', weight: '22.5 kg', rate: '₹14/kg', subtotal: 315 },
      { name: 'Cardboard (Gatta)', weight: '14.0 kg', rate: '₹10/kg', subtotal: 140 },
      { name: 'Iron / Steel Scrap', weight: '8.5 kg', rate: '₹32/kg', subtotal: 272 }
    ],
    totalPaid: 727,
    paymentMethod: 'Instant UPI (PhonePe)',
    carbonOffsetKg: 64.5,
    treesSavedFraction: 0.52
  },
  {
    id: 'KC-8721',
    customerName: 'Priya Verma',
    phone: '+91 98711 54321',
    address: 'B-12, Sector 15, Noida',
    pincode: '201301',
    scheduledSlot: 'Yesterday, 11:00 AM',
    status: 'completed',
    createdAt: '2026-09-06T09:15:00Z',
    categories: ['ewaste', 'metal'],
    estimatedWeight: '1 Unit + 15 kg',
    estimatedAmount: 3200,
    kabadwala: {
      id: 'kw-3',
      name: 'Santosh Yadav',
      businessName: 'Yadav Metal & E-Waste Solutions',
      phone: '+91 99581 22345',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 4.95,
      vehicle: 'Tata Ace (UP-16AT-7742)'
    },
    itemsWeighed: [
      { name: 'Split AC (1.5 Ton)', weight: '1 unit', rate: '₹2,850/unit', subtotal: 2850 },
      { name: 'Old Bicycle', weight: '1 unit', rate: '₹350/unit', subtotal: 350 }
    ],
    totalPaid: 3200,
    paymentMethod: 'Instant UPI (Google Pay)',
    carbonOffsetKg: 80.0,
    treesSavedFraction: 0.65
  }
];
