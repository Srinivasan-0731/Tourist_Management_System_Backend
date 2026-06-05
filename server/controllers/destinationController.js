import Destination from '../models/Destination.js';

// GET /api/destinations
const getAllDestinations = async (req, res) => {
  try {
    const { category, search, featured, limit = 10, page = 1 } = req.query;

    let query = { isActive: true };
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Destination.countDocuments(query);
    const destinations = await Destination.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: destinations.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: destinations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/destinations/:id
const getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }
    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/destinations
const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, message: 'Destination created!', data: destination });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/destinations/:id
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }
    res.json({ success: true, message: 'Destination updated!', data: destination });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE /api/destinations/:id
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }
    res.json({ success: true, message: 'Destination deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/destinations/seed/data
const seedDestinations = async (req, res) => {
  try {
    await Destination.deleteMany({});
    const sampleData = [
      {
        name: 'Rome', country: 'Italy', category: 'cultural',
        price: 746, rating: 4.5, duration: '7 Days', featured: true,
        description: 'Explore the eternal city of Rome with ancient ruins, art and incredible food.',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
        highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain'],
        included: ['Hotel', 'Breakfast', 'Tour Guide'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Kashmir', country: 'India', category: 'mountain',
        price: 650, rating: 4.9, duration: '5 Days', featured: true,
        description: 'Paradise on Earth with snow-capped mountains and serene lakes.',
        image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400',
        highlights: ['Dal Lake', 'Gulmarg', 'Pahalgam'],
        included: ['Hotel', 'All Meals', 'Houseboat'],
        notIncluded: ['Flights', 'Personal expenses']
      },
      {
        name: 'Maldives', country: 'Maldives', category: 'beach',
        price: 1200, rating: 4.9, duration: '6 Days', featured: true,
        description: 'Crystal clear waters and luxury overwater bungalows.',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
        highlights: ['Snorkeling', 'Water Villas', 'Sunset Cruises'],
        included: ['Resort Stay', 'All Meals', 'Water Sports'],
        notIncluded: ['Flights', 'Visa']
      },
      {
        name: 'Amazon', country: 'Brazil', category: 'adventure',
        price: 980, rating: 4.8, duration: '10 Days', featured: false,
        description: 'Wild Amazon rainforest adventure with exotic wildlife.',
        image: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=400',
        highlights: ['Jungle Safari', 'River Cruise', 'Wildlife Spotting'],
        included: ['Camp Stay', 'All Meals', 'Safari Guide'],
        notIncluded: ['Flights', 'Travel Insurance']
      },
      {
        name: 'Kyoto', country: 'Japan', category: 'cultural',
        price: 850, rating: 4.8, duration: '7 Days', featured: false,
        description: 'Ancient temples, geisha culture and zen gardens.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
        highlights: ['Fushimi Inari', 'Arashiyama', 'Gion District'],
        included: ['Hotel', 'Breakfast', 'Temple Passes'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Santorini', country: 'Greece', category: 'beach',
        price: 1100, rating: 4.9, duration: '5 Days', featured: true,
        description: 'Iconic blue domes and breathtaking sunsets over the Aegean Sea.',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
        highlights: ['Oia Sunset', 'Caldera Views', 'Wine Tasting'],
        included: ['Hotel', 'Breakfast', 'Island Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'London', country: 'UK', category: 'city',
        price: 890, rating: 4.7, duration: '7 Days', featured: false,
        description: 'Royal history, iconic landmarks and vibrant modern culture.',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
        highlights: ['Big Ben', 'Buckingham Palace', 'Tower Bridge'],
        included: ['Hotel', 'Breakfast', 'City Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Serengeti', country: 'Tanzania', category: 'wildlife',
        price: 1500, rating: 4.9, duration: '8 Days', featured: false,
        description: 'Witness the Great Migration and Big Five in their natural habitat.',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
        highlights: ['Great Migration', 'Big Five Safari', 'Hot Air Balloon'],
        included: ['Safari Lodge', 'All Meals', 'Game Drives'],
        notIncluded: ['Flights', 'Visa', 'Travel Insurance']
      },
      {
        name: 'Paris', country: 'France', category: 'city',
        price: 950, rating: 4.8, duration: '6 Days', featured: true,
        description: 'The City of Light with the Eiffel Tower, Louvre and world-class cuisine.',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
        included: ['Hotel', 'Breakfast', 'Museum Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Bali', country: 'Indonesia', category: 'beach',
        price: 750, rating: 4.7, duration: '7 Days', featured: true,
        description: 'Tropical paradise with stunning temples, rice terraces and beaches.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
        highlights: ['Uluwatu Temple', 'Tegalalang Rice Terrace', 'Seminyak Beach'],
        included: ['Villa Stay', 'Breakfast', 'Temple Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Dubai', country: 'UAE', category: 'city',
        price: 1050, rating: 4.8, duration: '5 Days', featured: true,
        description: 'Futuristic skyline, luxury shopping and thrilling desert adventures.',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        highlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
        included: ['Hotel', 'Breakfast', 'Desert Safari'],
        notIncluded: ['Flights', 'Visa', 'Lunch']
      },
      {
        name: 'New York', country: 'USA', category: 'city',
        price: 1300, rating: 4.7, duration: '7 Days', featured: false,
        description: 'The city that never sleeps with Times Square, Central Park and more.',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
        highlights: ['Times Square', 'Central Park', 'Statue of Liberty'],
        included: ['Hotel', 'Breakfast', 'City Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Singapore', country: 'Singapore', category: 'city',
        price: 880, rating: 4.7, duration: '5 Days', featured: false,
        description: 'Modern city-state known for Gardens by the Bay and amazing street food.',
        image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
        highlights: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island'],
        included: ['Hotel', 'Breakfast', 'City Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Bangkok', country: 'Thailand', category: 'city',
        price: 600, rating: 4.6, duration: '6 Days', featured: false,
        description: 'Vibrant street life, ornate temples and an amazing food scene.',
        image: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400',
        highlights: ['Grand Palace', 'Wat Pho', 'Chatuchak Market'],
        included: ['Hotel', 'Breakfast', 'Temple Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Sydney', country: 'Australia', category: 'city',
        price: 1150, rating: 4.8, duration: '7 Days', featured: false,
        description: 'Opera House, Harbour Bridge and stunning beaches make Sydney unforgettable.',
        image: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=400',
        highlights: ['Opera House', 'Harbour Bridge', 'Bondi Beach'],
        included: ['Hotel', 'Breakfast', 'Harbour Cruise'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Barcelona', country: 'Spain', category: 'city',
        price: 870, rating: 4.8, duration: '6 Days', featured: false,
        description: 'Gaudi architecture, vibrant nightlife and beautiful Mediterranean beaches.',
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
        highlights: ['Sagrada Familia', 'Park Guell', 'Las Ramblas'],
        included: ['Hotel', 'Breakfast', 'City Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Kerala', country: 'India', category: 'beach',
        price: 520, rating: 4.7, duration: '6 Days', featured: true,
        description: "God's Own Country with backwaters, elephant festivals and ayurvedic retreats.",
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
        highlights: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Kovalam Beach'],
        included: ['Houseboat', 'All Meals', 'Ayurvedic Spa'],
        notIncluded: ['Flights', 'Personal expenses']
      },
      {
        name: 'Rajasthan', country: 'India', category: 'cultural',
        price: 480, rating: 4.6, duration: '8 Days', featured: true,
        description: 'Land of kings with majestic forts, palaces, sand dunes and vibrant culture.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
        highlights: ['Amber Fort', 'Thar Desert', 'City Palace Udaipur'],
        included: ['Heritage Hotel', 'Breakfast', 'Camel Safari'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Goa', country: 'India', category: 'beach',
        price: 350, rating: 4.5, duration: '5 Days', featured: false,
        description: 'Sun, sand and surf with Portugal-influenced architecture and vibrant nightlife.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
        highlights: ['Calangute Beach', 'Old Goa Churches', 'Dudhsagar Falls'],
        included: ['Hotel', 'Breakfast', 'Beach Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'New Zealand', country: 'New Zealand', category: 'adventure',
        price: 1400, rating: 4.9, duration: '10 Days', featured: false,
        description: 'Breathtaking fjords, bungee jumping and the land of the Lord of the Rings.',
        image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400',
        highlights: ['Milford Sound', 'Queenstown', 'Hobbiton'],
        included: ['Hotel', 'Breakfast', 'Adventure Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Cairo', country: 'Egypt', category: 'cultural',
        price: 700, rating: 4.5, duration: '6 Days', featured: false,
        description: 'Ancient pyramids, the Sphinx and the mighty River Nile await explorers.',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400',
        highlights: ['Pyramids of Giza', 'Egyptian Museum', 'Nile River Cruise'],
        included: ['Hotel', 'Breakfast', 'Guided Tour'],
        notIncluded: ['Flights', 'Visa', 'Lunch']
      },
      {
        name: 'Machu Picchu', country: 'Peru', category: 'adventure',
        price: 1250, rating: 4.9, duration: '8 Days', featured: false,
        description: 'The Lost City of the Incas — a UNESCO World Heritage Site high in the Andes.',
        image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400',
        highlights: ['Machu Picchu Citadel', 'Inca Trail', 'Sacred Valley'],
        included: ['Hotel', 'All Meals', 'Guided Trek'],
        notIncluded: ['Flights', 'Travel Insurance']
      },
      {
        name: 'Amsterdam', country: 'Netherlands', category: 'city',
        price: 820, rating: 4.6, duration: '5 Days', featured: false,
        description: 'Canal houses, world-famous museums and vibrant cycling culture.',
        image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400',
        highlights: ['Anne Frank House', 'Van Gogh Museum', 'Canal Cruise'],
        included: ['Hotel', 'Breakfast', 'Museum Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Tokyo', country: 'Japan', category: 'city',
        price: 1100, rating: 4.9, duration: '8 Days', featured: true,
        description: 'A city where ultramodern meets traditional, from neon-lit skyscrapers to historic temples.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        highlights: ['Shibuya Crossing', 'Mount Fuji', 'Senso-ji Temple'],
        included: ['Hotel', 'Breakfast', 'Rail Pass'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Phuket', country: 'Thailand', category: 'beach',
        price: 680, rating: 4.6, duration: '6 Days', featured: false,
        description: 'Stunning beaches, crystal clear waters and vibrant island nightlife.',
        image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400',
        highlights: ['Phi Phi Islands', 'Big Buddha', 'Patong Beach'],
        included: ['Resort Stay', 'Breakfast', 'Island Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Cape Town', country: 'South Africa', category: 'adventure',
        price: 990, rating: 4.8, duration: '7 Days', featured: false,
        description: 'Table Mountain, Cape of Good Hope and incredible wildlife experiences.',
        image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400',
        highlights: ['Table Mountain', 'Cape of Good Hope', 'Robben Island'],
        included: ['Hotel', 'Breakfast', 'City Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Istanbul', country: 'Turkey', category: 'cultural',
        price: 780, rating: 4.7, duration: '6 Days', featured: false,
        description: 'Where East meets West — stunning mosques, grand bazaars and Bosphorus views.',
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
        highlights: ['Hagia Sophia', 'Grand Bazaar', 'Bosphorus Cruise'],
        included: ['Hotel', 'Breakfast', 'City Tour'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
      {
        name: 'Swiss Alps', country: 'Switzerland', category: 'mountain',
        price: 1800, rating: 4.9, duration: '7 Days', featured: true,
        description: 'Majestic snow-capped peaks, charming villages and world-class skiing.',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
        highlights: ['Jungfraujoch', 'Interlaken', 'Zermatt & Matterhorn'],
        included: ['Chalet Stay', 'All Meals', 'Ski Pass'],
        notIncluded: ['Flights', 'Personal expenses']
      },
      {
        name: 'Manali', country: 'India', category: 'mountain',
        price: 420, rating: 4.6, duration: '6 Days', featured: false,
        description: 'Snow-capped Himalayas, adventure sports and scenic Rohtang Pass.',
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
        highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple'],
        included: ['Hotel', 'All Meals', 'Adventure Activities'],
        notIncluded: ['Flights', 'Personal expenses']
      },
      {
        name: 'Agra', country: 'India', category: 'cultural',
        price: 300, rating: 4.7, duration: '3 Days', featured: false,
        description: 'Home to the magnificent Taj Mahal — one of the Seven Wonders of the World.',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
        highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri'],
        included: ['Hotel', 'Breakfast', 'Monument Passes'],
        notIncluded: ['Flights', 'Lunch', 'Dinner']
      },
    ];

    const destinations = await Destination.insertMany(sampleData);
    res.json({ success: true, message: `${destinations.length} destinations seeded!`, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  seedDestinations
};