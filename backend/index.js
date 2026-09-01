const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cropkart_secret_key_2024';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('../website'));

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    cb(null, 'img_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const locationCoordinates = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Delhi: { lat: 28.7041, lng: 77.1025 }
};

let users = [
  {
    id: 'farmer1',
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'farmer',
    location: 'Pune',
    phone: '9876543210',
    farmName: 'Green Valley Farms',
    yearsActive: 9,
    totalCropsSold: 184,
    averageRating: 4.7,
    coordinates: locationCoordinates.Pune
  },
  {
    id: 'farmer2',
    name: 'Anita Patil',
    email: 'anita@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'farmer',
    location: 'Nashik',
    phone: '9876501234',
    farmName: 'Patil Fresh Produce',
    yearsActive: 12,
    totalCropsSold: 261,
    averageRating: 4.8,
    coordinates: locationCoordinates.Nashik
  },
  {
    id: 'buyer1',
    name: 'FreshMart',
    email: 'buyer@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'buyer',
    location: 'Mumbai',
    phone: '9123456789',
    coordinates: locationCoordinates.Mumbai
  },
  {
    id: 'admin1',
    name: 'CropKart Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    location: 'Pune',
    phone: '9000000000'
  }
];

const makeCrop = ({
  id,
  farmerId,
  name,
  variety,
  quantity,
  unit = 'kg',
  expectedPrice,
  harvestDate,
  qualityGrade,
  fertilizersUsed,
  organic,
  moisturePercent,
  storageType,
  description,
  category,
  imageSeed
}) => {
  const farmer = users.find((u) => u.id === farmerId);
  const imageName = imageSeed || name.toLowerCase().replace(/\s+/g, '-');

  return {
    id,
    farmerId,
    farmerName: farmer.name,
    farmName: farmer.farmName,
    name,
    variety,
    category,
    quantity,
    quantityAvailable: quantity,
    unit,
    expectedPrice,
    pricePerUnit: expectedPrice,
    priceUnit: 'quintal',
    harvestDate,
    qualityGrade,
    fertilizersUsed,
    organic,
    moisturePercent,
    storageType,
    location: farmer.location,
    farmLocation: `${farmer.farmName}, ${farmer.location}`,
    image: `/uploads/${imageName}.jpg`,
    photos: [
      `/uploads/${imageName}.jpg`,
      `/uploads/${imageName}-field.jpg`,
      `/uploads/${imageName}-pack.jpg`
    ],
    description,
    createdAt: new Date(),
    coordinates: farmer.coordinates
  };
};

let crops = [
  makeCrop({
    id: 'crop1',
    farmerId: 'farmer1',
    name: 'Wheat',
    variety: 'Sharbati Premium',
    quantity: 1200,
    expectedPrice: 2450,
    harvestDate: '2026-08-12',
    qualityGrade: 'Premium',
    fertilizersUsed: ['Vermicompost', 'Neem cake', 'DAP micro dose'],
    organic: false,
    moisturePercent: 11.2,
    storageType: 'Ventilated jute bags',
    category: 'Grain',
    description: 'Clean, bold-grain wheat sorted for flour mills and institutional kitchens.',
    imageSeed: 'wheat'
  }),
  makeCrop({
    id: 'crop2',
    farmerId: 'farmer1',
    name: 'Tomato',
    variety: 'Arka Rakshak',
    quantity: 650,
    expectedPrice: 1850,
    harvestDate: '2026-08-25',
    qualityGrade: 'A',
    fertilizersUsed: ['Compost', 'Calcium nitrate', 'Seaweed extract'],
    organic: false,
    moisturePercent: 92,
    storageType: 'Crate packed, shade cooled',
    category: 'Vegetable',
    description: 'Firm red tomatoes graded for retail counters and restaurant supply.',
    imageSeed: 'tomato'
  }),
  makeCrop({
    id: 'crop3',
    farmerId: 'farmer1',
    name: 'Soybean',
    variety: 'JS 335',
    quantity: 900,
    expectedPrice: 4680,
    harvestDate: '2026-08-18',
    qualityGrade: 'A',
    fertilizersUsed: ['Rhizobium culture', 'Farmyard manure', 'Single super phosphate'],
    organic: true,
    moisturePercent: 10.5,
    storageType: 'Dry warehouse bins',
    category: 'Pulse',
    description: 'Low-moisture soybean lot suitable for oil processors and feed buyers.',
    imageSeed: 'soybean'
  }),
  makeCrop({
    id: 'crop4',
    farmerId: 'farmer1',
    name: 'Cotton',
    variety: 'Bt RCH 659',
    quantity: 420,
    expectedPrice: 7200,
    harvestDate: '2026-08-09',
    qualityGrade: 'Premium',
    fertilizersUsed: ['NPK 19:19:19', 'Potash', 'Micronutrient mix'],
    organic: false,
    moisturePercent: 8.8,
    storageType: 'Covered bale storage',
    category: 'Fiber',
    description: 'Premium long-staple cotton with clean picking and low trash content.',
    imageSeed: 'cotton'
  }),
  makeCrop({
    id: 'crop5',
    farmerId: 'farmer1',
    name: 'Onion',
    variety: 'N-53 Red',
    quantity: 1500,
    expectedPrice: 2100,
    harvestDate: '2026-08-15',
    qualityGrade: 'A',
    fertilizersUsed: ['Farmyard manure', 'Sulphur granules', 'Bio potash'],
    organic: false,
    moisturePercent: 86,
    storageType: 'Cured and rack stored',
    category: 'Vegetable',
    description: 'Uniform red onions with good shelf life for wholesale mandis.',
    imageSeed: 'onion'
  }),
  makeCrop({
    id: 'crop6',
    farmerId: 'farmer1',
    name: 'Green Chilli',
    variety: 'G4 Bullet',
    quantity: 280,
    expectedPrice: 3600,
    harvestDate: '2026-08-28',
    qualityGrade: 'B',
    fertilizersUsed: ['Organic compost', 'NPK drip feed', 'Neem extract spray'],
    organic: false,
    moisturePercent: 88,
    storageType: 'Reusable harvest crates',
    category: 'Vegetable',
    description: 'Fresh spicy chillies harvested in small batches for hotels and caterers.',
    imageSeed: 'green-chilli'
  }),
  makeCrop({
    id: 'crop7',
    farmerId: 'farmer2',
    name: 'Grapes',
    variety: 'Thompson Seedless',
    quantity: 720,
    expectedPrice: 5400,
    harvestDate: '2026-08-20',
    qualityGrade: 'Premium',
    fertilizersUsed: ['Organic compost', 'Calcium boron', 'Humic acid'],
    organic: true,
    moisturePercent: 81,
    storageType: 'Pre-cooled ventilated crates',
    category: 'Fruit',
    description: 'Export-style seedless grapes with tight bunches and sweet profile.',
    imageSeed: 'grapes'
  }),
  makeCrop({
    id: 'crop8',
    farmerId: 'farmer2',
    name: 'Pomegranate',
    variety: 'Bhagwa',
    quantity: 560,
    expectedPrice: 6800,
    harvestDate: '2026-08-22',
    qualityGrade: 'Premium',
    fertilizersUsed: ['Farmyard manure', 'Boron spray', 'Bio-stimulant'],
    organic: false,
    moisturePercent: 79,
    storageType: 'Foam-net carton ready',
    category: 'Fruit',
    description: 'Deep red pomegranates with consistent sizing for premium retail.',
    imageSeed: 'pomegranate'
  }),
  makeCrop({
    id: 'crop9',
    farmerId: 'farmer2',
    name: 'Capsicum',
    variety: 'Indra Green',
    quantity: 340,
    expectedPrice: 3100,
    harvestDate: '2026-08-27',
    qualityGrade: 'A',
    fertilizersUsed: ['Cocopeat compost', 'Calcium nitrate', 'Bio fungicide'],
    organic: true,
    moisturePercent: 93,
    storageType: 'Shade packed crates',
    category: 'Vegetable',
    description: 'Glossy green capsicum sorted by size for quick commerce and restaurants.',
    imageSeed: 'capsicum'
  }),
  makeCrop({
    id: 'crop10',
    farmerId: 'farmer2',
    name: 'Maize',
    variety: 'Pioneer 3396',
    quantity: 1100,
    expectedPrice: 2320,
    harvestDate: '2026-08-10',
    qualityGrade: 'A',
    fertilizersUsed: ['Urea split dose', 'Zinc sulphate', 'Compost'],
    organic: false,
    moisturePercent: 12.4,
    storageType: 'Dry tarpaulin covered storage',
    category: 'Grain',
    description: 'Yellow maize lot suitable for feed mills and starch processors.',
    imageSeed: 'maize'
  }),
  makeCrop({
    id: 'crop11',
    farmerId: 'farmer2',
    name: 'Turmeric',
    variety: 'Salem',
    quantity: 480,
    expectedPrice: 8200,
    harvestDate: '2026-08-05',
    qualityGrade: 'Premium',
    fertilizersUsed: ['Vermicompost', 'Neem cake', 'Trichoderma'],
    organic: true,
    moisturePercent: 9.7,
    storageType: 'Dried and gunny packed',
    category: 'Spice',
    description: 'High-curcumin turmeric fingers processed for spice manufacturers.',
    imageSeed: 'turmeric'
  }),
  makeCrop({
    id: 'crop12',
    farmerId: 'farmer2',
    name: 'Coriander',
    variety: 'Local Leafy',
    quantity: 95,
    expectedPrice: 1400,
    harvestDate: '2026-08-30',
    qualityGrade: 'B',
    fertilizersUsed: ['Compost tea', 'Bio NPK', 'Neem extract'],
    organic: true,
    moisturePercent: 89,
    storageType: 'Morning-harvest bundles',
    category: 'Herb',
    description: 'Fresh leafy coriander bundled for local retailers and kitchens.',
    imageSeed: 'coriander'
  })
];

let purchaseRequests = [
  {
    id: 'req1',
    cropId: 'crop2',
    buyerId: 'buyer1',
    buyerName: 'FreshMart',
    farmerId: 'farmer1',
    farmerName: 'Ramesh Kumar',
    cropName: 'Tomato',
    requestedQuantity: 25,
    unit: 'kg',
    offeredPrice: 1850,
    orderType: 'sample',
    sampleApproved: false,
    message: 'Need a crate sample for our Mumbai store quality check.',
    status: 'pending',
    createdAt: new Date()
  }
];

let messages = [
  {
    id: 'msg1',
    threadId: 'crop2_buyer1_farmer1',
    cropId: 'crop2',
    senderId: 'buyer1',
    senderRole: 'buyer',
    senderName: 'FreshMart',
    text: 'Can you supply tomatoes twice a week if the sample is approved?',
    createdAt: new Date(Date.now() - 1000 * 60 * 25)
  },
  {
    id: 'msg2',
    threadId: 'crop2_buyer1_farmer1',
    cropId: 'crop2',
    senderId: 'farmer1',
    senderRole: 'farmer',
    senderName: 'Ramesh Kumar',
    text: 'Yes, I can reserve 150 kg per delivery with crate packing.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18)
  }
];

let reviews = [];
let favorites = [];
let notifications = [];

let nextCropId = 13;
let nextRequestId = 2;
let nextMessageId = 3;
let nextReviewId = 1;
let nextNotificationId = 1;

const marketPriceReference = {
  wheat: [
    { market: 'Pune APMC', price: 2350, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 2480, unit: 'quintal' },
    { market: 'Nashik Yard', price: 2420, unit: 'quintal' }
  ],
  tomato: [
    { market: 'Pune APMC', price: 1720, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 1900, unit: 'quintal' },
    { market: 'Bangalore Yard', price: 1810, unit: 'quintal' }
  ],
  soybean: [
    { market: 'Pune APMC', price: 4600, unit: 'quintal' },
    { market: 'Indore Reference', price: 4820, unit: 'quintal' },
    { market: 'Nashik Yard', price: 4710, unit: 'quintal' }
  ],
  cotton: [
    { market: 'Pune APMC', price: 7000, unit: 'quintal' },
    { market: 'Nagpur Cotton Yard', price: 7280, unit: 'quintal' },
    { market: 'Mumbai Export', price: 7160, unit: 'quintal' }
  ],
  onion: [
    { market: 'Lasalgaon', price: 2050, unit: 'quintal' },
    { market: 'Pune APMC', price: 2180, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 2260, unit: 'quintal' }
  ],
  'green chilli': [
    { market: 'Pune APMC', price: 3400, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 3750, unit: 'quintal' },
    { market: 'Nashik Yard', price: 3550, unit: 'quintal' }
  ],
  grapes: [
    { market: 'Nashik Fruit Yard', price: 5200, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 5650, unit: 'quintal' },
    { market: 'Pune APMC', price: 5480, unit: 'quintal' }
  ],
  pomegranate: [
    { market: 'Nashik Fruit Yard', price: 6550, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 7100, unit: 'quintal' },
    { market: 'Pune APMC', price: 6740, unit: 'quintal' }
  ],
  capsicum: [
    { market: 'Nashik Yard', price: 2920, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 3300, unit: 'quintal' },
    { market: 'Pune APMC', price: 3150, unit: 'quintal' }
  ],
  maize: [
    { market: 'Pune APMC', price: 2250, unit: 'quintal' },
    { market: 'Nashik Yard', price: 2380, unit: 'quintal' },
    { market: 'Mumbai Feed Market', price: 2340, unit: 'quintal' }
  ],
  turmeric: [
    { market: 'Sangli Spice Yard', price: 7900, unit: 'quintal' },
    { market: 'Nashik Yard', price: 8350, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 8600, unit: 'quintal' }
  ],
  coriander: [
    { market: 'Nashik Yard', price: 1250, unit: 'quintal' },
    { market: 'Pune APMC', price: 1480, unit: 'quintal' },
    { market: 'Mumbai Wholesale', price: 1560, unit: 'quintal' }
  ]
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const getPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
  phone: user.phone,
  farmName: user.farmName,
  yearsActive: user.yearsActive,
  totalCropsSold: user.totalCropsSold,
  averageRating: user.averageRating,
  coordinates: user.coordinates
});

const getAvailability = (crop) => {
  if (crop.quantity <= 0) return { label: 'Sold Out', level: 'sold-out' };
  if (crop.quantity <= 100) return { label: `Low Stock: ${crop.quantity}${crop.unit}`, level: 'low-stock' };
  return { label: `In Stock: ${crop.quantity}${crop.unit}`, level: 'in-stock' };
};

const enrichCrop = (crop) => ({
  ...crop,
  availability: getAvailability(crop)
});

const getMarketPrices = (cropName) => marketPriceReference[cropName.toLowerCase()] || marketPriceReference.wheat;

const getThreadId = (cropId, buyerId, farmerId) => `${cropId}_${buyerId}_${farmerId}`;

const requestStatuses = ['pending', 'accepted', 'rejected', 'Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'];
const trackingStatuses = ['Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'];

const getRequestAmount = (request) => request.requestedQuantity * request.offeredPrice;

const createNotification = (userId, type, message, meta = {}) => {
  if (!userId) return null;
  const notification = {
    id: 'notif' + nextNotificationId++,
    userId,
    type,
    message,
    meta,
    read: false,
    createdAt: new Date()
  };
  notifications.unshift(notification);
  return notification;
};

const getRequestCropAndBuyer = (request) => {
  const crop = crops.find((c) => c.id === request.cropId);
  const buyer = users.find((u) => u.id === request.buyerId);
  return { crop, buyer };
};

const getTransportOptions = (request) => {
  const { crop, buyer } = getRequestCropAndBuyer(request);
  const farmerCoords = crop?.coordinates || locationCoordinates.Pune;
  const buyerCoords = buyer?.coordinates || locationCoordinates[buyer?.location] || locationCoordinates.Mumbai;
  const distanceKm = Math.max(8, Math.round(getDistance(
    farmerCoords.lat,
    farmerCoords.lng,
    buyerCoords.lat,
    buyerCoords.lng
  )));
  const quantity = Number(request.requestedQuantity) || 1;
  const baseCost = Math.round(distanceKm * 18 + quantity * 2.4);

  return [
    {
      id: 'mini-truck',
      vehicleType: 'Mini Truck',
      capacity: 'Up to 750 kg',
      estimatedCost: baseCost,
      eta: `${Math.max(2, Math.ceil(distanceKm / 65))} hrs`,
      distanceKm
    },
    {
      id: 'tempo',
      vehicleType: 'Refrigerated Tempo',
      capacity: 'Up to 1.5 tons',
      estimatedCost: Math.round(baseCost * 1.35),
      eta: `${Math.max(3, Math.ceil(distanceKm / 58))} hrs`,
      distanceKm
    },
    {
      id: 'lorry',
      vehicleType: 'Shared Lorry',
      capacity: 'Up to 5 tons',
      estimatedCost: Math.round(baseCost * 0.82),
      eta: `${Math.max(5, Math.ceil(distanceKm / 45))} hrs`,
      distanceKm
    }
  ];
};

const recomputeFarmerRating = (farmerId) => {
  const farmerReviews = reviews.filter((review) => review.farmerId === farmerId && review.reviewerRole === 'buyer');
  const farmer = users.find((u) => u.id === farmerId);
  if (!farmer || farmerReviews.length === 0) return;
  const average = farmerReviews.reduce((sum, review) => sum + review.farmerRating, 0) / farmerReviews.length;
  farmer.averageRating = Number(average.toFixed(1));
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, location, phone } = req.body;

  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = role + '_' + Date.now();
  const newUser = {
    id: userId,
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    location,
    phone,
    farmName: role === 'farmer' ? `${name}'s Farm` : undefined,
    yearsActive: role === 'farmer' ? 1 : undefined,
    totalCropsSold: role === 'farmer' ? 0 : undefined,
    averageRating: role === 'farmer' ? 4.5 : undefined,
    coordinates: locationCoordinates[location] || locationCoordinates.Pune
  };

  users.push(newUser);

  const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: getPublicUser(newUser) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: getPublicUser(user) });
});

app.get('/api/crops/nearby', (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.json(crops.map(enrichCrop));
  }

  const userLat = parseFloat(latitude);
  const userLng = parseFloat(longitude);

  const nearbyCrops = crops
    .map((crop) => ({
      ...crop,
      distance: getDistance(userLat, userLng, crop.coordinates.lat, crop.coordinates.lng)
    }))
    .filter((crop) => crop.distance <= parseFloat(radius))
    .sort((a, b) => a.distance - b.distance)
    .map(enrichCrop);

  res.json(nearbyCrops);
});

app.get('/api/crops', (req, res) => {
  res.json(crops.map(enrichCrop));
});

app.get('/api/crops/:id', (req, res) => {
  const crop = crops.find((c) => c.id === req.params.id);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });
  res.json(enrichCrop(crop));
});

app.post('/api/crops', authenticateToken, upload.single('image'), (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Only farmers can add crops' });
  }

  const farmer = users.find((u) => u.id === req.user.id);
  const {
    name,
    variety,
    quantity,
    unit = 'kg',
    expectedPrice,
    location,
    description,
    latitude,
    longitude,
    harvestDate,
    qualityGrade = 'A',
    fertilizersUsed = '',
    organic = false,
    moisturePercent = 0,
    storageType = 'Farm storage',
    category = 'Produce'
  } = req.body;

  const image = req.file ? '/uploads/' + req.file.filename : '/uploads/default.jpg';
  const coordinates = {
    lat: parseFloat(latitude) || farmer.coordinates?.lat || 18.5204,
    lng: parseFloat(longitude) || farmer.coordinates?.lng || 73.8567
  };

  const newCrop = {
    id: 'crop' + nextCropId++,
    farmerId: req.user.id,
    farmerName: farmer.name,
    farmName: farmer.farmName,
    name,
    variety: variety || 'Standard',
    category,
    quantity: parseInt(quantity),
    quantityAvailable: parseInt(quantity),
    unit,
    expectedPrice: parseFloat(expectedPrice),
    pricePerUnit: parseFloat(expectedPrice),
    priceUnit: 'quintal',
    harvestDate: harvestDate || new Date().toISOString().slice(0, 10),
    qualityGrade,
    fertilizersUsed: Array.isArray(fertilizersUsed)
      ? fertilizersUsed
      : String(fertilizersUsed).split(',').map((item) => item.trim()).filter(Boolean),
    organic: organic === true || organic === 'true' || organic === 'yes',
    moisturePercent: parseFloat(moisturePercent) || 0,
    storageType,
    location: location || farmer.location,
    farmLocation: `${farmer.farmName}, ${location || farmer.location}`,
    description,
    image,
    photos: [image],
    createdAt: new Date(),
    coordinates
  };

  crops.push(newCrop);
  res.status(201).json(enrichCrop(newCrop));
});

app.put('/api/crops/:id', authenticateToken, upload.single('image'), (req, res) => {
  const crop = crops.find((c) => c.id === req.params.id);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  if (crop.farmerId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updateFields = [
    'name',
    'variety',
    'unit',
    'location',
    'description',
    'harvestDate',
    'qualityGrade',
    'storageType',
    'category'
  ];
  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) crop[field] = req.body[field];
  });

  if (req.body.quantity !== undefined) {
    crop.quantity = parseInt(req.body.quantity);
    crop.quantityAvailable = crop.quantity;
  }
  if (req.body.expectedPrice !== undefined) {
    crop.expectedPrice = parseFloat(req.body.expectedPrice);
    crop.pricePerUnit = crop.expectedPrice;
  }
  if (req.body.moisturePercent !== undefined) crop.moisturePercent = parseFloat(req.body.moisturePercent);
  if (req.body.organic !== undefined) crop.organic = req.body.organic === true || req.body.organic === 'true' || req.body.organic === 'yes';
  if (req.body.fertilizersUsed !== undefined) {
    crop.fertilizersUsed = String(req.body.fertilizersUsed).split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (req.file) {
    crop.image = '/uploads/' + req.file.filename;
    crop.photos = [crop.image, ...(crop.photos || []).filter((photo) => photo !== crop.image)];
  }

  res.json(enrichCrop(crop));
});

app.delete('/api/crops/:id', authenticateToken, (req, res) => {
  const cropIndex = crops.findIndex((c) => c.id === req.params.id);
  if (cropIndex === -1) return res.status(404).json({ error: 'Crop not found' });

  const crop = crops[cropIndex];
  if (crop.farmerId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  crops.splice(cropIndex, 1);
  res.json({ message: 'Crop deleted' });
});

app.get('/api/farmers/:farmerId', (req, res) => {
  const farmer = users.find((u) => u.id === req.params.farmerId && u.role === 'farmer');
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

  const farmerCrops = crops.filter((crop) => crop.farmerId === farmer.id).map(enrichCrop);
  const recentReviews = reviews
    .filter((review) => review.farmerId === farmer.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);
  res.json({
    farmer: getPublicUser(farmer),
    crops: farmerCrops,
    reviews: recentReviews,
    stats: {
      currentListings: farmerCrops.length,
      totalCropsSold: farmer.totalCropsSold || 0,
      averageRating: farmer.averageRating || 0
    }
  });
});

app.get('/api/market-prices/:cropName', (req, res) => {
  res.json(getMarketPrices(req.params.cropName));
});

app.get('/api/market-comparison/:cropId', (req, res) => {
  const crop = crops.find((c) => c.id === req.params.cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  const marketPrices = getMarketPrices(crop.name);
  const averageMarketPrice = Math.round(
    marketPrices.reduce((total, item) => total + item.price, 0) / marketPrices.length
  );
  const delta = crop.expectedPrice - averageMarketPrice;
  const deltaPercent = Number(((delta / averageMarketPrice) * 100).toFixed(1));

  res.json({
    cropId: crop.id,
    cropName: crop.name,
    farmerPrice: crop.expectedPrice,
    priceUnit: crop.priceUnit,
    marketPrices,
    averageMarketPrice,
    delta,
    deltaPercent,
    position: delta > 0 ? 'above' : delta < 0 ? 'below' : 'at'
  });
});

app.post('/api/purchase-requests', authenticateToken, (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can create purchase requests' });
  }

  const buyer = users.find((u) => u.id === req.user.id);
  const { cropId, quantity, offeredPrice, message, orderType = 'bulk' } = req.body;
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  if (!['sample', 'bulk'].includes(orderType)) {
    return res.status(400).json({ error: 'Invalid order type' });
  }

  const requestedQuantity = orderType === 'sample'
    ? Math.min(parseInt(quantity) || 5, 25)
    : parseInt(quantity);

  const newRequest = {
    id: 'req' + nextRequestId++,
    cropId,
    buyerId: req.user.id,
    buyerName: buyer.name,
    farmerId: crop.farmerId,
    farmerName: crop.farmerName,
    cropName: crop.name,
    requestedQuantity,
    unit: crop.unit,
    offeredPrice: offeredPrice ? parseFloat(offeredPrice) : crop.expectedPrice,
    orderType,
    sampleApproved: false,
    message,
    status: 'pending',
    createdAt: new Date()
  };

  purchaseRequests.push(newRequest);
  createNotification(
    crop.farmerId,
    'purchase_request',
    `${buyer.name} sent a ${orderType} request for ${crop.name}.`,
    { requestId: newRequest.id, cropId: crop.id }
  );
  res.status(201).json(newRequest);
});

app.get('/api/purchase-requests', authenticateToken, (req, res) => {
  let requests;

  if (req.user.role === 'farmer') {
    requests = purchaseRequests.filter((r) => r.farmerId === req.user.id);
  } else if (req.user.role === 'buyer') {
    requests = purchaseRequests.filter((r) => r.buyerId === req.user.id);
  } else {
    requests = purchaseRequests;
  }

  res.json(requests);
});

app.put('/api/purchase-requests/:id', authenticateToken, (req, res) => {
  const request = purchaseRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const { status, sampleApproved, transportOptionId } = req.body;

  if (status !== undefined) {
    if (!requestStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    if (['accepted', 'rejected'].includes(status)) {
      if (request.farmerId !== req.user.id) {
        return res.status(403).json({ error: 'Only the farmer can accept or reject requests' });
      }
    } else if (trackingStatuses.includes(status)) {
      if (request.farmerId !== req.user.id) {
        return res.status(403).json({ error: 'Only the farmer can advance order tracking' });
      }
      if (!trackingStatuses.includes(request.status)) {
        return res.status(400).json({ error: 'Order must be confirmed before tracking can advance' });
      }
    } else if (status === 'pending') {
      return res.status(400).json({ error: 'Requests cannot be reset to pending' });
    }
    request.status = status;
    const recipientId = req.user.id === request.farmerId ? request.buyerId : request.farmerId;
    createNotification(
      recipientId,
      'status_change',
      `${request.cropName} request is now ${status}.`,
      { requestId: request.id, cropId: request.cropId }
    );
  }

  if (sampleApproved !== undefined) {
    if (request.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Only the buyer can mark a sample as satisfied' });
    }
    if (request.orderType !== 'sample' || request.status !== 'accepted') {
      return res.status(400).json({ error: 'Only accepted sample requests can be marked satisfied' });
    }
    request.sampleApproved = Boolean(sampleApproved);
    createNotification(
      request.farmerId,
      'sample_approved',
      `${request.buyerName} marked the ${request.cropName} sample as approved.`,
      { requestId: request.id, cropId: request.cropId }
    );
  }

  if (transportOptionId !== undefined) {
    if (request.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Only the buyer can choose transport' });
    }
    if (request.orderType !== 'bulk' || request.status !== 'accepted') {
      return res.status(400).json({ error: 'Transport can be chosen for accepted bulk requests only' });
    }
    const selected = getTransportOptions(request).find((option) => option.id === transportOptionId);
    if (!selected) return res.status(400).json({ error: 'Invalid transport option' });
    request.transportOption = selected;
    request.status = 'Confirmed';
    request.confirmedAt = new Date();
    createNotification(
      request.farmerId,
      'transport_selected',
      `${request.buyerName} confirmed ${request.cropName} with ${selected.vehicleType}.`,
      { requestId: request.id, cropId: request.cropId }
    );
  }

  res.json(request);
});

app.get('/api/purchase-requests/:id/transport-options', authenticateToken, (req, res) => {
  const request = purchaseRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (![request.buyerId, request.farmerId].includes(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  if (request.orderType !== 'bulk') {
    return res.status(400).json({ error: 'Transport options are available for bulk orders only' });
  }
  res.json(getTransportOptions(request));
});

app.get('/api/messages/:cropId', authenticateToken, (req, res) => {
  const crop = crops.find((c) => c.id === req.params.cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  let threadMessages;
  if (req.user.role === 'farmer') {
    if (crop.farmerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    threadMessages = messages.filter((message) => message.cropId === crop.id);
  } else if (req.user.role === 'buyer') {
    const threadId = getThreadId(crop.id, req.user.id, crop.farmerId);
    threadMessages = messages.filter((message) => message.threadId === threadId);
  } else {
    threadMessages = messages.filter((message) => message.cropId === crop.id);
  }

  res.json(threadMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { cropId, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' });

  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  if (req.user.role !== 'buyer' && req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Only buyers and farmers can send messages' });
  }
  if (req.user.role === 'farmer' && crop.farmerId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const sender = users.find((u) => u.id === req.user.id);
  const buyerId = req.user.role === 'buyer'
    ? req.user.id
    : (messages.find((message) => message.cropId === crop.id && message.senderRole === 'buyer')?.senderId || 'buyer1');

  const newMessage = {
    id: 'msg' + nextMessageId++,
    threadId: getThreadId(crop.id, buyerId, crop.farmerId),
    cropId: crop.id,
    senderId: req.user.id,
    senderRole: req.user.role,
    senderName: sender.name,
    text: text.trim(),
    createdAt: new Date()
  };

  messages.push(newMessage);
  createNotification(
    req.user.role === 'buyer' ? crop.farmerId : buyerId,
    'chat_message',
    `${sender.name} sent a message about ${crop.name}.`,
    { cropId: crop.id, threadId: newMessage.threadId }
  );
  res.status(201).json(newMessage);
});

app.get('/api/farmer/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Only farmers can access this' });
  }

  const farmerCrops = crops.filter((c) => c.farmerId === req.user.id).map(enrichCrop);
  const farmerRequests = purchaseRequests.filter((r) => r.farmerId === req.user.id);

  res.json({
    crops: farmerCrops,
    purchaseRequests: farmerRequests,
    stats: {
      totalCrops: farmerCrops.length,
      pendingRequests: farmerRequests.filter((r) => r.status === 'pending').length,
      acceptedRequests: farmerRequests.filter((r) => r.status === 'accepted').length,
      sampleRequests: farmerRequests.filter((r) => r.orderType === 'sample').length,
      bulkRequests: farmerRequests.filter((r) => r.orderType === 'bulk').length
    }
  });
});

app.get('/api/buyer/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can access this' });
  }

  const buyerRequests = purchaseRequests.filter((r) => r.buyerId === req.user.id);

  res.json({
    purchaseRequests: buyerRequests,
    stats: {
      totalRequests: buyerRequests.length,
      pendingRequests: buyerRequests.filter((r) => r.status === 'pending').length,
      acceptedRequests: buyerRequests.filter((r) => r.status === 'accepted').length,
      samplesSatisfied: buyerRequests.filter((r) => r.sampleApproved).length
    }
  });
});

app.get('/api/favorites', authenticateToken, (req, res) => {
  const userFavorites = favorites.filter((favorite) => favorite.userId === req.user.id);
  res.json({
    crops: userFavorites
      .filter((favorite) => favorite.type === 'crop')
      .map((favorite) => crops.find((crop) => crop.id === favorite.targetId))
      .filter(Boolean)
      .map(enrichCrop),
    farmers: userFavorites
      .filter((favorite) => favorite.type === 'farmer')
      .map((favorite) => users.find((user) => user.id === favorite.targetId && user.role === 'farmer'))
      .filter(Boolean)
      .map(getPublicUser)
  });
});

app.post('/api/favorites', authenticateToken, (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can save favorites' });
  }
  const { type, targetId } = req.body;
  if (!['crop', 'farmer'].includes(type)) return res.status(400).json({ error: 'Invalid favorite type' });
  const targetExists = type === 'crop'
    ? crops.some((crop) => crop.id === targetId)
    : users.some((user) => user.id === targetId && user.role === 'farmer');
  if (!targetExists) return res.status(404).json({ error: 'Favorite target not found' });

  const existingIndex = favorites.findIndex((favorite) =>
    favorite.userId === req.user.id && favorite.type === type && favorite.targetId === targetId
  );
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    return res.json({ saved: false });
  }

  favorites.push({ userId: req.user.id, type, targetId, createdAt: new Date() });
  res.status(201).json({ saved: true });
});

app.post('/api/reviews', authenticateToken, (req, res) => {
  const { requestId, farmerRating, cropRating, buyerRating, comment = '' } = req.body;
  const request = purchaseRequests.find((r) => r.id === requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'Delivered') return res.status(400).json({ error: 'Reviews open after delivery only' });

  const isBuyerReview = req.user.role === 'buyer' && request.buyerId === req.user.id;
  const isFarmerReview = req.user.role === 'farmer' && request.farmerId === req.user.id;
  if (!isBuyerReview && !isFarmerReview) return res.status(403).json({ error: 'Unauthorized' });

  const duplicate = reviews.find((review) => review.requestId === requestId && review.reviewerId === req.user.id);
  if (duplicate) return res.status(400).json({ error: 'Review already submitted for this order' });

  const reviewer = users.find((user) => user.id === req.user.id);
  const review = {
    id: 'review' + nextReviewId++,
    requestId,
    cropId: request.cropId,
    cropName: request.cropName,
    farmerId: request.farmerId,
    buyerId: request.buyerId,
    reviewerId: req.user.id,
    reviewerName: reviewer.name,
    reviewerRole: req.user.role,
    farmerRating: isBuyerReview ? Math.min(5, Math.max(1, Number(farmerRating) || 5)) : undefined,
    cropRating: isBuyerReview ? Math.min(5, Math.max(1, Number(cropRating) || 5)) : undefined,
    buyerRating: isFarmerReview ? Math.min(5, Math.max(1, Number(buyerRating) || 5)) : undefined,
    comment: String(comment).trim(),
    createdAt: new Date()
  };

  reviews.push(review);
  recomputeFarmerRating(request.farmerId);
  createNotification(
    isBuyerReview ? request.farmerId : request.buyerId,
    'review',
    `${reviewer.name} submitted a review for ${request.cropName}.`,
    { requestId: request.id, cropId: request.cropId }
  );
  res.status(201).json(review);
});

app.get('/api/notifications', authenticateToken, (req, res) => {
  res.json(notifications.filter((notification) => notification.userId === req.user.id).slice(0, 25));
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notification = notifications.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  res.json(notification);
});

app.post('/api/assistant/query', authenticateToken, (req, res) => {
  const query = String(req.body.query || '').toLowerCase();
  const farmerCrops = crops.filter((crop) => crop.farmerId === req.user.id);
  const buyerRequests = purchaseRequests.filter((request) => request.buyerId === req.user.id || request.farmerId === req.user.id);

  if (query.includes('buyer')) {
    const topBuyer = users.find((user) => user.role === 'buyer');
    return res.json({
      answer: topBuyer
        ? `${topBuyer.name} is the strongest current buyer signal based on active requests and location coverage.`
        : 'No buyer activity is available yet.',
      actionLabel: 'View Buyers',
      actionUrl: req.user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace'
    });
  }

  if (query.includes('price') || query.includes('market') || query.includes('compare')) {
    const crop = farmerCrops.find((item) => query.includes(item.name.toLowerCase())) || farmerCrops[0] || crops[0];
    const marketPrices = getMarketPrices(crop.name);
    const averageMarketPrice = Math.round(marketPrices.reduce((total, item) => total + item.price, 0) / marketPrices.length);
    const delta = crop.expectedPrice - averageMarketPrice;
    return res.json({
      answer: `${crop.name} is listed at Rs.${crop.expectedPrice}/quintal, ${Math.abs(delta)} ${delta >= 0 ? 'above' : 'below'} the market average of Rs.${averageMarketPrice}.`,
      actionLabel: 'Update Price',
      actionUrl: `/crop/${crop.id}`
    });
  }

  if (query.includes('order') || query.includes('status')) {
    const active = buyerRequests.filter((request) => !['rejected', 'Delivered'].includes(request.status));
    return res.json({
      answer: `You have ${active.length} active order${active.length === 1 ? '' : 's'} in progress.`,
      actionLabel: req.user.role === 'buyer' ? 'View Orders' : 'View Requests',
      actionUrl: req.user.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard'
    });
  }

  res.json({
    answer: 'Ask me to compare your price to market, find the best buyer, or summarize active order status.',
    actionLabel: 'Browse Marketplace',
    actionUrl: '/marketplace'
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  const completedRequests = purchaseRequests.filter((request) => ['accepted', 'Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'].includes(request.status));
  const salesByDate = completedRequests.reduce((acc, request) => {
    const day = new Date(request.createdAt).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + getRequestAmount(request);
    return acc;
  }, {});
  const cropSales = completedRequests.reduce((acc, request) => {
    acc[request.cropName] = (acc[request.cropName] || 0) + request.requestedQuantity;
    return acc;
  }, {});
  const farmerEarnings = completedRequests.reduce((acc, request) => {
    acc[request.farmerName] = (acc[request.farmerName] || 0) + getRequestAmount(request);
    return acc;
  }, {});
  const buyerSpend = completedRequests.reduce((acc, request) => {
    acc[request.buyerName] = (acc[request.buyerName] || 0) + getRequestAmount(request);
    return acc;
  }, {});
  const buyerPurchases = completedRequests.reduce((acc, request) => {
    acc[request.cropName] = (acc[request.cropName] || 0) + 1;
    return acc;
  }, {});

  res.json({
    farmers: users.filter((u) => u.role === 'farmer').length,
    buyers: users.filter((u) => u.role === 'buyer').length,
    crops: crops.length,
    purchaseRequests: purchaseRequests.length,
    transactions: completedRequests.length,
    charts: {
      salesOverTime: Object.entries(salesByDate).map(([label, value]) => ({ label, value })),
      bestSellingCrops: Object.entries(cropSales).map(([label, value]) => ({ label, value })),
      farmerEarnings: Object.entries(farmerEarnings).map(([label, value]) => ({ label, value })),
      buyerSpend: Object.entries(buyerSpend).map(([label, value]) => ({ label, value })),
      mostPurchasedCrops: Object.entries(buyerPurchases).map(([label, value]) => ({ label, value }))
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'CropKart API is running' });
});

app.listen(PORT, () => {
  console.log(`CropKart Backend running on http://localhost:${PORT}`);
});
