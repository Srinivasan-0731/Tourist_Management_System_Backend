import mongoose from 'mongoose';
import Package from '../models/Package.js';

// GET /api/packages
const getAllPackages = async (req, res) => {
  try {
    const {
      packageType, search, featured,
      destination, limit = 10, page = 1
    } = req.query;

    let query = { isActive: true };

    if (packageType) query.packageType = packageType;
    if (featured)    query.featured    = featured === 'true';

    if (destination) {
      try {
        query.destination = new mongoose.Types.ObjectId(destination);
      } catch (e) {
        query.destination = destination;
      }
    }

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip     = (Number(page) - 1) * Number(limit);
    const total    = await Package.countDocuments(query);
    const packages = await Package.find(query)
      .populate('destination', 'name country image category')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: packages.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: packages
    });
  } catch (err) {
    console.error('GET ALL PACKAGES ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/packages/:id
const getPackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('destination', 'name country image category description');

    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    res.json({ success: true, data: pkg });
  } catch (err) {
    console.error('GET PACKAGE ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/packages
const createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, message: 'Package created!', data: pkg });
  } catch (err) {
    console.error('CREATE PACKAGE ERROR:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/packages/:id
const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    res.json({ success: true, message: 'Package updated!', data: pkg });
  } catch (err) {
    console.error('UPDATE PACKAGE ERROR:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE /api/packages/:id
const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    res.json({ success: true, message: 'Package deleted!' });
  } catch (err) {
    console.error('DELETE PACKAGE ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/packages/seed
const seedPackages = async (req, res) => {
  try {
    await Package.deleteMany({});

    const sampleData = [
      {
        title:        'Bali Beach Paradise',
        description:  'Tropical paradise with stunning temples, rice terraces and beaches.',
        price:        750,
        discountPrice: 650,
        duration:     '7 Days',
        maxGuests:    20,
        packageType:  'standard',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
        highlights:   ['Uluwatu Temple', 'Tegalalang Rice Terrace', 'Seminyak Beach'],
        included:     ['Villa Stay', 'Breakfast', 'Temple Tour'],
        notIncluded:  ['Flights', 'Lunch', 'Dinner'],
      },
      {
        title:        'Dubai Luxury Experience',
        description:  'Futuristic skyline, luxury shopping and thrilling desert adventures.',
        price:        1050,
        discountPrice: 0,
        duration:     '5 Days',
        maxGuests:    15,
        packageType:  'luxury',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        highlights:   ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
        included:     ['Hotel', 'Breakfast', 'Desert Safari'],
        notIncluded:  ['Flights', 'Visa', 'Lunch'],
      },
      {
        title:        'Kerala Backwaters Tour',
        description:  "God's Own Country with backwaters, elephant festivals and ayurvedic retreats.",
        price:        520,
        discountPrice: 450,
        duration:     '6 Days',
        maxGuests:    25,
        packageType:  'budget',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
        highlights:   ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Kovalam Beach'],
        included:     ['Houseboat', 'All Meals', 'Ayurvedic Spa'],
        notIncluded:  ['Flights', 'Personal expenses'],
      },
      {
        title:        'Rajasthan Heritage Tour',
        description:  'Land of kings with majestic forts, palaces, sand dunes and vibrant culture.',
        price:        480,
        discountPrice: 0,
        duration:     '8 Days',
        maxGuests:    30,
        packageType:  'standard',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
        highlights:   ['Amber Fort', 'Thar Desert', 'City Palace Udaipur'],
        included:     ['Heritage Hotel', 'Breakfast', 'Camel Safari'],
        notIncluded:  ['Flights', 'Lunch', 'Dinner'],
      },
      {
        title:        'Paris Romantic Getaway',
        description:  'The City of Light with the Eiffel Tower, Louvre and world-class cuisine.',
        price:        950,
        discountPrice: 850,
        duration:     '6 Days',
        maxGuests:    10,
        packageType:  'premium',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
        highlights:   ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
        included:     ['Hotel', 'Breakfast', 'Museum Pass'],
        notIncluded:  ['Flights', 'Lunch', 'Dinner'],
      },
      {
        title:        'Swiss Alps Adventure',
        description:  'Majestic snow-capped peaks, charming villages and world-class skiing.',
        price:        1800,
        discountPrice: 0,
        duration:     '7 Days',
        maxGuests:    12,
        packageType:  'luxury',
        featured:     true,
        isActive:     true,
        image:        'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
        highlights:   ['Jungfraujoch', 'Interlaken', 'Zermatt & Matterhorn'],
        included:     ['Chalet Stay', 'All Meals', 'Ski Pass'],
        notIncluded:  ['Flights', 'Personal expenses'],
      },
    ];

    const packages = await Package.insertMany(sampleData);
    res.json({
      success: true,
      message: `${packages.length} packages seeded!`,
      data: packages
    });
  } catch (err) {
    console.error('SEED ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  getAllPackages, getPackage,
  createPackage, updatePackage,
  deletePackage, seedPackages
};