import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

const INITIAL_CROPS = [
  {
    id: 'crop-1',
    name: 'Sharbati Wheat (Grade A+)',
    variety: 'C-306 Heirloom',
    category: 'Grains',
    price: 2850,
    unit: 'quintal',
    quantity: 450,
    quantityUnit: 'qtl',
    farmerId: 'farmer-1',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98231 44512',
    location: 'Nashik, Maharashtra',
    harvestDate: '18 Sep 2026',
    grade: 'Grade A+',
    moisture: '10.5%',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80',
    description: 'Direct sun-dried Sharbati golden grains with exceptional chapati softness and high gluten strength. 100% sortex cleaned.',
    status: 'listed',
  },
  {
    id: 'crop-2',
    name: 'Basmati Rice Pusa 1121',
    variety: 'Pusa 1121 Traditional',
    category: 'Grains',
    price: 4300,
    unit: 'quintal',
    quantity: 320,
    quantityUnit: 'qtl',
    farmerId: 'farmer-2',
    farmerName: 'Gurpreet Singh',
    farmerPhone: '+91 98722 33410',
    location: 'Karnal, Haryana',
    harvestDate: '12 Sep 2026',
    grade: 'Export Grade',
    moisture: '11.8%',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80',
    description: 'Extra long grain aromatic Basmati. Average grain length 8.35mm after cooking. Zero pesticide residue certified.',
    status: 'listed',
  },
  {
    id: 'crop-3',
    name: 'Organic Hybrid Tomatoes',
    variety: 'Abhinav F1',
    category: 'Vegetables',
    price: 2200,
    unit: 'quintal',
    quantity: 180,
    quantityUnit: 'qtl',
    farmerId: 'farmer-3',
    farmerName: 'Vitthal Rao Deshmukh',
    farmerPhone: '+91 94220 89102',
    location: 'Pune Rural, Maharashtra',
    harvestDate: '24 Sep 2026',
    grade: 'Grade A+',
    moisture: 'Fresh Harvest',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80',
    description: 'Firm, uniform crimson red tomatoes ideal for wholesale retail and long distance refrigerated transport.',
    status: 'under-offer',
  },
  {
    id: 'crop-4',
    name: 'Alphonso Mango (Hapus)',
    variety: 'Devgad Hapus',
    category: 'Fruits',
    price: 1200,
    unit: 'box (12 pcs)',
    quantity: 650,
    quantityUnit: 'boxes',
    farmerId: 'farmer-4',
    farmerName: 'Sudhir Sawant',
    farmerPhone: '+91 91580 44211',
    location: 'Ratnagiri, Maharashtra',
    harvestDate: '20 Sep 2026',
    grade: 'Export Grade',
    moisture: 'GI Tagged',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=700&q=80',
    description: 'GI-tagged Devgad Alphonso mangoes, naturally ripened with rice hay. Saffron pulp and rich aromatic sweetness.',
    status: 'listed',
  },
  {
    id: 'crop-5',
    name: 'Yellow Soybeans',
    variety: 'JS 335 Certified',
    category: 'Oilseeds',
    price: 4920,
    unit: 'quintal',
    quantity: 400,
    quantityUnit: 'qtl',
    farmerId: 'farmer-1',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98231 44512',
    location: 'Nashik, Maharashtra',
    harvestDate: '15 Sep 2026',
    grade: 'Grade A',
    moisture: '9.2%',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80',
    description: 'High oil and protein content certified soybean batch, ideal for solvent extraction and dal mills.',
    status: 'listed',
  },
  {
    id: 'crop-6',
    name: 'Nashik Red Onions',
    variety: 'Garwa / Late Kharif',
    category: 'Vegetables',
    price: 2400,
    unit: 'quintal',
    quantity: 520,
    quantityUnit: 'qtl',
    farmerId: 'farmer-5',
    farmerName: 'Tukaram Patil',
    farmerPhone: '+91 98901 11234',
    location: 'Lasalgaon, Maharashtra',
    harvestDate: '22 Sep 2026',
    grade: 'Grade A+',
    moisture: 'Dry Cured',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=80',
    description: 'Export quality large size Nashik red onions with thick papery outer scales and minimum 3 months storage life.',
    status: 'listed',
  },
];

const INITIAL_OFFERS = [
  {
    id: 'off-101',
    cropId: 'crop-1',
    cropName: 'Sharbati Wheat (Grade A+)',
    buyerId: 'buyer-1',
    buyerName: 'Metro Cash & Carry Wholesale',
    buyerLocation: 'Thane Hub, Mumbai',
    offeredPrice: 2800,
    listedPrice: 2850,
    quantity: 200,
    unit: 'quintal',
    totalOffer: 560000,
    status: 'pending',
    date: '10 mins ago',
    message: 'We require immediate delivery to Thane APMC warehouse. Escrow deposit already pre-authorized.',
  },
  {
    id: 'off-102',
    cropId: 'crop-3',
    cropName: 'Organic Hybrid Tomatoes',
    buyerId: 'buyer-2',
    buyerName: 'Priya Agros & Retail Chain',
    buyerLocation: 'Vashi Sector 19, Navi Mumbai',
    offeredPrice: 2150,
    listedPrice: 2200,
    quantity: 100,
    unit: 'quintal',
    totalOffer: 215000,
    status: 'pending',
    date: '1 hour ago',
    message: 'Looking for 3 lots weekly. Can contract for continuous procurement if quality matches sample.',
  },
];

const INITIAL_ORDERS = [
  {
    id: '9021',
    orderNumber: 'CK-ORD-9021',
    cropId: 'crop-1',
    cropName: 'Sharbati Wheat (Grade A+)',
    farmerId: 'farmer-1',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Nashik Farm Cluster, MH',
    farmerCoords: { lat: 19.9975, lng: 73.7898 },
    buyerId: 'buyer-1',
    buyerName: 'Metro Cash & Carry Wholesale',
    buyerLocation: 'Vashi APMC Wholesale Market, Mumbai',
    buyerCoords: { lat: 19.0760, lng: 72.8777 },
    quantity: 200,
    unit: 'quintal',
    agreedPrice: 2800,
    totalAmount: 560000,
    status: 'in-transit',
    transporterId: 'trans-1',
    transporterName: 'Kisan Logistics Fleet',
    transporterVehicle: 'MH-15-EG-4089 (10T Insulated)',
    transporterPhone: '+91 99214 55099',
    createdAt: 'Yesterday, 04:30 PM',
    estimatedDelivery: 'Today, 06:00 PM',
    distanceKm: 168,
    etaHours: '3h 40m',
  },
  {
    id: '9020',
    orderNumber: 'CK-ORD-9020',
    cropId: 'crop-6',
    cropName: 'Nashik Red Onions',
    farmerId: 'farmer-5',
    farmerName: 'Tukaram Patil',
    farmerLocation: 'Lasalgaon Mandi, MH',
    farmerCoords: { lat: 20.1478, lng: 74.2289 },
    buyerId: 'buyer-3',
    buyerName: 'Spices & Agri Exports Ltd',
    buyerLocation: 'JNPT Port Logistics Park, Navi Mumbai',
    buyerCoords: { lat: 18.9499, lng: 72.9515 },
    quantity: 250,
    unit: 'quintal',
    agreedPrice: 2350,
    totalAmount: 587500,
    status: 'accepted',
    transporterId: null,
    transporterName: null,
    transporterVehicle: null,
    createdAt: 'Today, 09:15 AM',
    estimatedDelivery: 'Tomorrow, 02:00 PM',
    distanceKm: 215,
    etaHours: '4h 50m',
  },
  {
    id: '9019',
    orderNumber: 'CK-ORD-9019',
    cropId: 'crop-2',
    cropName: 'Basmati Rice Pusa 1121',
    farmerId: 'farmer-2',
    farmerName: 'Gurpreet Singh',
    farmerLocation: 'Karnal Mandi, HR',
    farmerCoords: { lat: 29.6857, lng: 76.9905 },
    buyerId: 'buyer-1',
    buyerName: 'Metro Cash & Carry Wholesale',
    buyerLocation: 'Delhi Azadpur APMC, DL',
    buyerCoords: { lat: 28.7159, lng: 77.1789 },
    quantity: 150,
    unit: 'quintal',
    agreedPrice: 4250,
    totalAmount: 637500,
    status: 'paid',
    transporterId: 'trans-2',
    transporterName: 'Sahyadri Agri Freight',
    transporterVehicle: 'HR-05-BX-8812',
    createdAt: '3 days ago',
    estimatedDelivery: 'Delivered & Paid',
    distanceKm: 130,
    etaHours: 'Completed',
  },
];

const INITIAL_TRANSPORTERS = [
  {
    id: 'trans-1',
    name: 'Kisan Logistics Fleet',
    vehicleType: '10T Eicher Insulated Refrigerator',
    regNumber: 'MH-15-EG-4089',
    driverName: 'Baljit Singh',
    phone: '+91 99214 55099',
    rating: 4.9,
    tripsCompleted: 142,
    baseRatePerKm: 32,
    location: 'Nashik Hub',
    status: 'Available',
    features: ['GPS Live Tracking', 'Temperature Controlled', 'Goods Transit Insured'],
  },
  {
    id: 'trans-2',
    name: 'Sahyadri Agri Freight',
    vehicleType: '14T BharatBenz Multi-Axle',
    regNumber: 'MH-12-QB-2041',
    driverName: 'Mahesh Jadhav',
    phone: '+91 98223 90114',
    rating: 4.8,
    tripsCompleted: 98,
    baseRatePerKm: 38,
    location: 'Pune APMC Ring Road',
    status: 'Available',
    features: ['Heavy Payload', 'Fast Corridor Pass', 'Verified Driver'],
  },
  {
    id: 'trans-3',
    name: 'Deccan Agro Cargo Lines',
    vehicleType: '7T Tata 407 Covered Van',
    regNumber: 'MH-04-AX-5531',
    driverName: 'Pravin Shinde',
    phone: '+91 91670 12890',
    rating: 4.7,
    tripsCompleted: 215,
    baseRatePerKm: 26,
    location: 'Navi Mumbai Vashi',
    status: 'Available',
    features: ['Quick Intra-City', 'Farm Gate Direct Pickup', 'Digital E-way Bill'],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'offer',
    title: 'New Offer Received: Sharbati Wheat',
    message: 'Metro Cash & Carry offered ₹2,800/qtl for 200 quintals (Total: ₹5,60,000).',
    time: '10 mins ago',
    read: false,
  },
  {
    id: 2,
    type: 'transport',
    title: 'Transporter En Route (Live GPS)',
    message: 'Truck MH-15-EG-4089 has entered Samruddhi Mahamarg. ETA 3h 40m.',
    time: '35 mins ago',
    read: false,
  },
  {
    id: 3,
    type: 'payment',
    title: 'Escrow Funds Credited: ₹6,37,500',
    message: 'Buyer confirmed receipt for Basmati Rice order CK-ORD-9019. Funds released to bank account.',
    time: '1 day ago',
    read: true,
  },
];

export const AppProvider = ({ children }) => {
  // Demo Role state: 'farmer' | 'buyer' | 'transporter'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('cropkart_role') || 'farmer';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return {
      id: 'farmer-1',
      name: 'Ramesh Patel',
      role: 'farmer',
      phone: '+91 98231 44512',
      location: 'Nashik, Maharashtra',
      verified: true,
      rating: 4.9,
      farmSize: '18 Acres',
    };
  });

  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [transporters, setTransporters] = useState(INITIAL_TRANSPORTERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [favorites, setFavorites] = useState(['crop-1', 'crop-3']);
  const [language, setLanguage] = useState('EN'); // 'EN' | 'हिं' | 'मर'
  const [searchQuery, setSearchQuery] = useState('');

  // Switch demo roles and adjust user persona
  const switchRole = (role) => {
    setCurrentRole(role);
    localStorage.setItem('cropkart_role', role);

    if (role === 'farmer') {
      setCurrentUser({
        id: 'farmer-1',
        name: 'Ramesh Patel',
        role: 'farmer',
        phone: '+91 98231 44512',
        location: 'Nashik, Maharashtra',
        verified: true,
        rating: 4.9,
        farmSize: '18 Acres',
      });
    } else if (role === 'buyer') {
      setCurrentUser({
        id: 'buyer-1',
        name: 'Metro Cash & Carry (Priya Agros)',
        role: 'buyer',
        phone: '+91 98110 99882',
        location: 'Vashi APMC, Mumbai',
        verified: true,
        rating: 4.95,
        procurementVolume: '450 Tonnes / month',
      });
    } else if (role === 'transporter') {
      setCurrentUser({
        id: 'trans-1',
        name: 'Baljit Singh (Kisan Logistics)',
        role: 'transporter',
        phone: '+91 99214 55099',
        location: 'Nashik Logistics Hub',
        verified: true,
        rating: 4.9,
        fleetSize: '12 Commercial Vehicles',
      });
    }
  };

  // Add a new crop (Farmer action)
  const addCrop = (newCrop) => {
    const crop = {
      id: `crop-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      location: currentUser.location,
      status: 'listed',
      imageUrl: newCrop.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80',
      ...newCrop,
    };

    setCrops((prev) => [crop, ...prev]);

    // Add notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'order',
        title: `Crop Listed: ${crop.name}`,
        message: `Your listing of ${crop.quantity} ${crop.unit} @ ₹${crop.price} is now live on the marketplace.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch (e) {}

    return crop;
  };

  // Make an offer (Buyer action)
  const makeOffer = ({ crop, offeredPrice, quantity, message }) => {
    const newOffer = {
      id: `off-${Date.now()}`,
      cropId: crop.id,
      cropName: crop.name,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerLocation: currentUser.location,
      offeredPrice: Number(offeredPrice),
      listedPrice: Number(crop.price),
      quantity: Number(quantity),
      unit: crop.unit || 'quintal',
      totalOffer: Number(offeredPrice) * Number(quantity),
      status: 'pending',
      date: 'Just now',
      message: message || 'Interested in immediate purchase. Ready to fund escrow.',
    };

    setOffers((prev) => [newOffer, ...prev]);

    // Update crop status
    setCrops((prev) =>
      prev.map((c) => (c.id === crop.id ? { ...c, status: 'under-offer' } : c))
    );

    // Add notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'offer',
        title: `Offer Sent: ₹${offeredPrice}/${crop.unit}`,
        message: `Offer of ₹${Number(newOffer.totalOffer).toLocaleString('en-IN')} sent to ${crop.farmerName}.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    return newOffer;
  };

  // Farmer accepts offer -> Creates active order!
  const acceptOffer = (offerId) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // Update offer status
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o))
    );

    // Create Order
    const newOrder = {
      id: `${Date.now()}`.slice(-4),
      orderNumber: `CK-ORD-${`${Date.now()}`.slice(-4)}`,
      cropId: offer.cropId,
      cropName: offer.cropName,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerLocation: currentUser.location,
      farmerCoords: { lat: 19.9975, lng: 73.7898 },
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      buyerLocation: offer.buyerLocation,
      buyerCoords: { lat: 19.0760, lng: 72.8777 },
      quantity: offer.quantity,
      unit: offer.unit,
      agreedPrice: offer.offeredPrice,
      totalAmount: offer.totalOffer,
      status: 'accepted',
      transporterId: null,
      transporterName: null,
      transporterVehicle: null,
      createdAt: 'Just now',
      estimatedDelivery: 'In 2 days',
      distanceKm: 168,
      etaHours: '3h 40m',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update crop
    setCrops((prev) =>
      prev.map((c) =>
        c.id === offer.cropId ? { ...c, status: 'accepted' } : c
      )
    );

    // Notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'order',
        title: `Offer Accepted: Order ${newOrder.orderNumber} Created!`,
        message: `Agreed price ₹${Number(offer.offeredPrice).toLocaleString('en-IN')}/${offer.unit} with ${offer.buyerName}. Next step: assign transporter.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    return newOrder;
  };

  // Farmer rejects offer
  const rejectOffer = (offerId) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o))
    );
  };

  // Assign Transporter to Order
  const assignTransporter = (orderId, transporter) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId || order.orderNumber === orderId) {
          return {
            ...order,
            status: 'in-transit',
            transporterId: transporter.id,
            transporterName: transporter.name,
            transporterVehicle: transporter.regNumber,
            transporterPhone: transporter.phone,
          };
        }
        return order;
      })
    );

    // Notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'transport',
        title: `Fleet Assigned: ${transporter.name}`,
        message: `${transporter.vehicleType} (${transporter.regNumber}) assigned to Order ${orderId}. Route optimization active.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Update Order Status (Placed -> Accepted -> In Transit -> Delivered -> Paid)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (newStatus === 'paid') {
      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      } catch (e) {}
    }
  };

  // Toggle watchlist
  const toggleFavorite = (cropId) => {
    setFavorites((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        switchRole,
        currentUser,
        setCurrentUser,
        crops,
        addCrop,
        offers,
        makeOffer,
        acceptOffer,
        rejectOffer,
        orders,
        assignTransporter,
        updateOrderStatus,
        transporters,
        notifications,
        markAllNotificationsRead,
        favorites,
        toggleFavorite,
        language,
        setLanguage,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
