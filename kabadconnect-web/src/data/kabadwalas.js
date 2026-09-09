export const CITY_COORDINATES = {
  ahmedabad: {
    name: 'Ahmedabad',
    center: [23.0135, 72.5125],
    userLocation: {
      name: 'Your Location: Prahlad Nagar, Ahmedabad',
      address: 'Near Iscon Cross Road, SG Highway',
      coords: [23.0135, 72.5125]
    },
    zoom: 14
  },
  delhi: {
    name: 'Delhi NCR',
    center: [28.6385, 77.3710],
    userLocation: {
      name: 'Your Location: Indirapuram / Sector 62',
      address: 'Amrapali Village, Indirapuram',
      coords: [28.6385, 77.3710]
    },
    zoom: 14
  },
  gurugram: {
    name: 'Gurugram',
    center: [28.4595, 77.0266],
    userLocation: {
      name: 'Your Location: Cyber City, Gurugram',
      address: 'DLF Phase 2, Gurugram',
      coords: [28.4595, 77.0266]
    },
    zoom: 14
  },
  bengaluru: {
    name: 'Bengaluru',
    center: [12.9352, 77.6245],
    userLocation: {
      name: 'Your Location: Koramangala, Bengaluru',
      address: '4th Block, 80 Feet Road',
      coords: [12.9352, 77.6245]
    },
    zoom: 14
  },
  mumbai: {
    name: 'Mumbai',
    center: [19.0596, 72.8295],
    userLocation: {
      name: 'Your Location: Bandra West, Mumbai',
      address: 'Hill Road, Bandra West',
      coords: [19.0596, 72.8295]
    },
    zoom: 14
  }
};

export const KABADWALA_PARTNERS = [
  {
    id: 'kw-5',
    name: 'Jignesh Patel',
    businessName: 'Sabarmati Clean Recyclers',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98980 12345',
    rating: 4.92,
    reviewsCount: 410,
    totalPickups: 1680,
    distanceKm: 0.8,
    locality: 'SG Highway & Prahlad Nagar',
    city: 'Ahmedabad',
    coords: [23.0185, 72.5080],
    vehicle: 'Electric Loading E-Rickshaw',
    vehicleReg: 'GJ-01-ER-6211',
    badge: 'Amdavad Top Rated',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2021',
    upiEnabled: true,
    status: 'en_route',
    etaMinutes: 12,
    recentReview: 'Very fast pickup near Iscon cross roads. Weighed with digital hanging scale, paid via UPI instantly.'
  },
  {
    id: 'kw-6',
    name: 'Kishore Bhai Vaghela',
    businessName: 'Amdavad Scrap & E-Waste Solutions',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98250 87654',
    rating: 4.88,
    reviewsCount: 325,
    totalPickups: 1120,
    distanceKm: 1.6,
    locality: 'Navrangpura & CG Road',
    city: 'Ahmedabad',
    coords: [23.0365, 72.5590],
    vehicle: 'Tata Ace Mini Truck',
    vehicleReg: 'GJ-27-TT-4412',
    badge: 'Heavy Scrap Specialist',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2020',
    upiEnabled: true,
    status: 'online',
    etaMinutes: 24,
    recentReview: 'Cleared our warehouse scrap in GIDC and office e-waste. Provided GST bill and digital scale guarantee.'
  },
  {
    id: 'kw-1',
    name: 'Ramesh Kumar',
    businessName: 'GreenEarth Scrap Enterprises',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98112 34567',
    rating: 4.9,
    reviewsCount: 342,
    totalPickups: 1420,
    distanceKm: 0.8,
    locality: 'Sector 62 / Indirapuram',
    city: 'Delhi NCR',
    coords: [28.6295, 77.3630],
    vehicle: 'Electric Loading E-Rickshaw',
    vehicleReg: 'DL-5ER-8921',
    badge: 'Eco Champion',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2021',
    upiEnabled: true,
    status: 'en_route',
    etaMinutes: 14,
    recentReview: 'Arrived exactly at 10 AM, weighed with digital scale, paid via PhonePe immediately! Highly recommended.'
  },
  {
    id: 'kw-2',
    name: 'Mohammad Saleem',
    businessName: 'Star Recyclers Hub',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98710 98123',
    rating: 4.8,
    reviewsCount: 289,
    totalPickups: 980,
    distanceKm: 1.4,
    locality: 'Vaishali / Kaushambi',
    city: 'Delhi NCR',
    coords: [28.6430, 77.3480],
    vehicle: 'Piaggio Ape 3-Wheeler Tempo',
    vehicleReg: 'UP-14BT-3419',
    badge: 'Top Rated',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2020',
    upiEnabled: true,
    status: 'online',
    etaMinutes: 20,
    recentReview: 'Cleared 40kg old newspapers and a dead washing machine. Very polite and transparent rates.'
  },
  {
    id: 'kw-3',
    name: 'Santosh Yadav',
    businessName: 'Yadav Metal & E-Waste Solutions',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 99581 22345',
    rating: 4.95,
    reviewsCount: 512,
    totalPickups: 2150,
    distanceKm: 2.1,
    locality: 'Noida Sector 18 & Atta',
    city: 'Delhi NCR',
    coords: [28.5700, 77.3200],
    vehicle: 'Tata Ace Mini Truck',
    vehicleReg: 'UP-16AT-7742',
    badge: 'Heavy Scrap Specialist',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2019',
    upiEnabled: true,
    status: 'online',
    etaMinutes: 30,
    recentReview: 'Best for heavy metal and old AC pickups. Brought heavy digital crane hook scale. Instant UPI payout.'
  },
  {
    id: 'kw-4',
    name: 'Vikram Singh',
    businessName: 'Swachh Bharat Scrap Express',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    phone: '+91 97118 76543',
    rating: 4.75,
    reviewsCount: 198,
    totalPickups: 650,
    distanceKm: 2.7,
    locality: 'Vasundhara / Sahibabad',
    city: 'Delhi NCR',
    coords: [28.6650, 77.3650],
    vehicle: 'Mahindra Bolero Maxi Truck',
    vehicleReg: 'UP-14CT-1102',
    badge: 'Fast Express Partner',
    digitalScaleVerified: true,
    kycVerified: true,
    operatingSince: '2022',
    upiEnabled: true,
    status: 'online',
    etaMinutes: 35,
    recentReview: 'Booked at 2 PM, pickup completed by 3:15 PM. Truly convenient and helps save the environment!'
  }
];
