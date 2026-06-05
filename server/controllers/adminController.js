import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Package from "../models/Package.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

// ── IS ADMIN CHECK ───────────────────────────────────
export const isAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      isAdmin: req.user.role === "admin",
    });
  } catch (error) {
    console.error("IS ADMIN ERROR:", error);
    res.status(500).json({ success: false, message: "Admin check failed" });
  }
};

// ── DASHBOARD DATA ───────────────────────────────────
export const getDashboardData = async (req, res) => {
  try {
    const totalBookings      = await Booking.countDocuments();
    const paidBookings       = await Booking.find({ paymentStatus: "paid" });
    const totalRevenue       = paidBookings.reduce((acc, b) => acc + b.totalPrice, 0);
    const pendingBookings    = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings  = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings  = await Booking.countDocuments({ status: "cancelled" });
    const totalUsers         = await User.countDocuments();
    const totalDestinations  = await Destination.countDocuments({ isActive: true });
    const totalPackages      = await Package.countDocuments({ isActive: true });
    const totalReviews       = await Review.countDocuments();

    const recentBookings = await Booking.find({})
      .populate("user",        "name email")
      .populate("package",     "title price")
      .populate("destination", "name country")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const topDestinations = await Destination.find({ isActive: true })
      .sort({ totalReviews: -1 })
      .limit(5);

    const featuredPackages = await Package.find({ featured: true, isActive: true })
      .populate("destination", "name country image")
      .limit(4);

    res.json({
      success: true,
      dashboardData: {
        stats: {
          totalBookings,
          totalRevenue,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          totalUsers,
          totalDestinations,
          totalPackages,
          totalReviews,
        },
        recentBookings,
        recentUsers,
        topDestinations,
        featuredPackages,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL USERS ────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE USER ──────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE USER ──────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User updated!", user });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE USER ──────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted!" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL DESTINATIONS ─────────────────────────────
export const getAllDestinations = async (req, res) => {
  try {
    const { search, category, limit = 10, page = 1 } = req.query;

    let query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
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
      destinations,
    });
  } catch (error) {
    console.error("GET DESTINATIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE DESTINATION ───────────────────────────────
export const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({
      success: true,
      message: "Destination created!",
      destination,
    });
  } catch (error) {
    console.error("CREATE DESTINATION ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── UPDATE DESTINATION ───────────────────────────────
export const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }
    res.json({ success: true, message: "Destination updated!", destination });
  } catch (error) {
    console.error("UPDATE DESTINATION ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE DESTINATION ───────────────────────────────
export const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }
    res.json({ success: true, message: "Destination deleted!" });
  } catch (error) {
    console.error("DELETE DESTINATION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL PACKAGES ─────────────────────────────────
export const getAllPackages = async (req, res) => {
  try {
    const { packageType, limit = 10, page = 1 } = req.query;

    let query = {};
    if (packageType) query.packageType = packageType;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Package.countDocuments(query);
    const packages = await Package.find(query)
      .populate("destination", "name country image")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: packages.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      packages,
    });
  } catch (error) {
    console.error("GET PACKAGES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE PACKAGE ───────────────────────────────────
export const createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({
      success: true,
      message: "Package created!",
      package: pkg,
    });
  } catch (error) {
    console.error("CREATE PACKAGE ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── UPDATE PACKAGE ───────────────────────────────────
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, message: "Package updated!", package: pkg });
  } catch (error) {
    console.error("UPDATE PACKAGE ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE PACKAGE ───────────────────────────────────
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, message: "Package deleted!" });
  } catch (error) {
    console.error("DELETE PACKAGE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL BOOKINGS ─────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, limit = 10, page = 1 } = req.query;

    let query = {};
    if (status)        query.status        = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("user",        "name email phone")
      .populate("package",     "title price duration")
      .populate("destination", "name country image")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE BOOKING STATUS ────────────────────────────
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    )
      .populate("user",        "name email")
      .populate("package",     "title price")
      .populate("destination", "name country");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking status updated!", booking });
  } catch (error) {
    console.error("UPDATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE BOOKING ───────────────────────────────────
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted!" });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL REVIEWS ──────────────────────────────────
export const getAllReviews = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments();
    const reviews = await Review.find({})
      .populate("user",        "name email")
      .populate("destination", "name country")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      reviews,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE REVIEW ────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const allReviews = await Review.find({ destination: review.destination });
    const avgRating  = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;
    await Destination.findByIdAndUpdate(review.destination, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    res.json({ success: true, message: "Review deleted!" });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};