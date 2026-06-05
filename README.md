#  TravelMS — Backend

A RESTful API built with **Node.js + Express + MongoDB** powering the TravelMS travel booking platform.

---

##  Tech Stack

| Tech | Usage |
|------|-------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication |
| Razorpay SDK | Payment gateway |
| bcryptjs | Password hashing |
| dotenv | Environment variables |
| cors | Cross-origin requests |

---

##  Project Structure

```
backend/
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── packageController.js
│   └── destinationController.js
├── models/
│   ├── User.js
│   ├── Booking.js
│   ├── Payment.js
│   ├── Review.js
│   ├── Package.js
│   └── Destination.js
├── routes/
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   ├── packageRoutes.js
│   └── destinationRoutes.js
├── middleware/
│   └── authMiddleware.js       # JWT verify + role check
├── .env
├── server.js
└── package.json
```

---

##  Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend/` root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/travelms
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

>  Never commit `.env` to Git. Add it to `.gitignore`.

### 3. Run Development Server

```bash
npm run dev
```

API runs at **http://localhost:5000**

### 4. Run Production

```bash
npm start
```

---

##  Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT token |
| GET | `/api/auth/me` | Private | Get current user profile |

### Register Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

##  Package Routes (`/api/packages`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/packages` | Public | Get all packages |
| GET | `/api/packages/:id` | Public | Get single package |
| POST | `/api/packages` | Admin | Create package |
| PUT | `/api/packages/:id` | Admin | Update package |
| DELETE | `/api/packages/:id` | Admin | Delete package |

---

##  Destination Routes (`/api/destinations`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/destinations` | Public | Get all destinations |
| GET | `/api/destinations/:id` | Public | Get single destination |
| POST | `/api/destinations` | Admin | Create destination |
| PUT | `/api/destinations/:id` | Admin | Update destination |
| DELETE | `/api/destinations/:id` | Admin | Delete destination |

---

##  Booking Routes (`/api/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Private | Create new booking |
| GET | `/api/bookings/my` | Private | Get my bookings |
| GET | `/api/bookings/:id` | Private | Get single booking |
| PUT | `/api/bookings/:id/cancel` | Private | Cancel booking |
| GET | `/api/bookings` | Admin | Get all bookings |
| PUT | `/api/bookings/:id/status` | Admin | Update booking status |

### Create Booking Request Body
```json
{
  "packageId": "64abc...",
  "travelDate": "2025-08-15",
  "returnDate": "2025-08-20",
  "guests": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "paymentMethod": "razorpay",
  "specialRequests": "Vegetarian food"
}
```

### Booking Status Values

| Status | Description |
|--------|-------------|
| `pending` | Newly created, payment not done |
| `confirmed` | Payment completed |
| `completed` | Trip finished |
| `cancelled` | Cancelled by user |

### Cancel Rules

| Status | Can Cancel? |
|--------|-------------|
| pending | ✅ Yes |
| confirmed | ✅ Yes |
| completed | ❌ No |
| cancelled | ❌ Already cancelled |

---

##  Payment Routes (`/api/payments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/create-order` | Private | Create Razorpay order |
| POST | `/api/payments/verify` | Private | Verify payment signature |
| POST | `/api/payments/failed` | Private | Record failed payment |

### Create Order Request Body
```json
{
  "bookingId": "64abc..."
}
```

### Create Order Response
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxxxxx",
    "amount": 500000,
    "currency": "INR",
    "bookingId": "64abc...",
    "keyId": "rzp_test_xxxxxxxxxx"
  }
}
```

### Verify Payment Request Body
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "xxxxxxxx",
  "bookingId": "64abc..."
}
```

>  Razorpay test mode max limit: **₹5,00,000 per transaction**

---

##  Review Routes (`/api/reviews`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Private | Create review |
| GET | `/api/reviews/my` | Private | Get my reviews |
| GET | `/api/reviews/destination/:id` | Public | Get reviews by destination |
| DELETE | `/api/reviews/:id` | Private | Delete review |

### Create Review Request Body
```json
{
  "destinationId": "64abc...",
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "The trip was absolutely wonderful..."
}
```

>  One review per user per destination — duplicate review returns 400 error.

---

##  Auth Middleware

JWT token must be passed in the `Authorization` header for all Private routes:

```
Authorization: Bearer <token>
```

### `authMiddleware.js`
```js
// Verify token
export const protect = async (req, res, next) => { ... };

// Admin only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

---

##  Mongoose Models

### User
```
name, email, password (hashed), role (user/admin), phone, avatar, createdAt
```

### Package
```
title, description, price, discountPrice, duration, maxGuests,
packageType, image, destination, itinerary, totalBookings, isActive
```

### Booking
```
user, package, destination, bookingId (auto), travelDate, returnDate,
guests {adults, children, infants}, totalGuests, totalPrice,
paymentMethod, paymentStatus, status, specialRequests,
razorpayOrderId, razorpayPaymentId
```

### Review
```
user, destination, rating (1-5), title, comment, isApproved, createdAt
```

### Destination
```
name, country, description, image, rating, totalReviews, isActive
```

---

##  Common Issues

| Issue | Fix |
|-------|-----|
| MongoDB connection fail | Check `MONGO_URI` in `.env` |
| JWT invalid error | Check `JWT_SECRET` matches login + verify |
| Razorpay 400 error | Amount exceeds ₹5L test limit |
| CORS error | Add frontend URL to cors config in `server.js` |
| 500 on booking create | Check package `_id` is valid ObjectId |

### CORS Setup in `server.js`
```js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

##  Standard API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

##  Seed Data (Optional)

To add sample destinations and packages:

```bash
node seed.js
```

---

##  Support

- Email: support@travelms.com
- Phone: +91 98765 43210

---

*Built with  using Node.js + Express + MongoDB*
