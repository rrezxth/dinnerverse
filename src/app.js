// ==============================
// CONFIGURATIONS
// ==============================
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
//const handlebars = require('./handlebar.js');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

//// IMPORT from directory  
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const {connectToMongo} = require("./database/dbconfig");
const User = require('./database/model/userModel');
const Restaurant = require('./database/model/restaurantModel');
const Menu = require('./database/model/menuModel');
const Item = require('./database/model/itemModel');
const Order = require('./database/model/orderModel');
const Reservation = require('./database/model/reservationModel');

// ==============================
// MIDDLEWARES
// ==============================
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Handlebars engine
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "../views/layouts"),
    partialsDir: path.join(__dirname, "../views/partials"),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        eq: function (v1, v2) {
            return v1 === v2;
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../views'));

// ==============================
// MIDDLEWARE HELPER FUNCTIONS
// ==============================
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Basic authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        // User is authenticated
        return next();
    } else {
        // Unauthorized
        req.session.unauthorizedMessage = 'You are unauthorized to access this page. Please LOGIN.';
        return res.redirect('/login');
    }
}

// ==============================
// PORT CONNECTION -- MONGODB HERE
// ==============================
connectToMongo()
    .then(() => {
        console.log('Connected to MongoDB...');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Listening in PORT: ${PORT}`));
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
    });

// ==============================
// ROUTE HANDLERS
// ==============================

// HOME Page
app.get('/', (req, res) => {
    res.render('index');
});

// User unauthorized 'page'
app.get('/clear-unauthorized-message', (req, res) => {
    req.session.unauthorizedMessage = null;
    res.sendStatus(200);
});


// LOGIN Page
app.get('/login', (req, res) => {
    const unauthorizedMessage = req.session.unauthorizedMessage;
    req.session.unauthorizedMessage = null; // Clear the message after fetching it
    res.render('loginPage', { unauthorizedMessage });
});


// LOGOUT Page
app.get('/logout-success', (req, res) => {
    res.render('logoutPage');
});

// REGISTER Page
app.get('/register', (req, res) => {
    res.render('registerPage');
});

// USER PROFILE Page
app.get('/user/profile', isAuthenticated, (req, res) => {
    res.render('userProfile');
});

// USER RECENT ORDERS Page
app.get('/user/retrieve-orders/', isAuthenticated, async (req, res) => {
    try {
        let orders;

        // Check if USER is 'customer'
        if (req.session.user.role === 'customer') {
            // Fetch orders for customers
            orders = await Order.find({ user_id: req.session.user.id })
                .populate('restaurant_id', 'name')
                .populate('items.item_id', 'name') // Still populate item_id if needed for additional details
                .sort({ createdAt: -1 })
                .lean();

        // CHeck if USER is 'restaurant'
        } else if (req.session.user.role === 'restaurant') {
            // Fetch the restaurant based on user ID
            const restaurant = await Restaurant.findOne({ account: req.session.user.id });
            if (restaurant) {
                orders = await Order.find({ restaurant_id: restaurant._id })
                    .populate('user_id', 'name email phoneNumber')
                    .populate('items.item_id', 'name')
                    .sort({ createdAt: -1 })
                    .lean();
            } else {
                return res.status(400).send({ error: 'Restaurant data not found' });
            }
        }

        // Format the dates before rendering
        if (orders) {
            orders.forEach(order => {
                order.pickup_time = new Date(order.pickup_time).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                });
                order.createdAt = new Date(order.createdAt).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                });
            });
        }

        res.render('userOrder.hbs', { orders });
    } catch (error) {
        console.error('Error retrieving user orders:', error);
        throw error;
    }
});


// SHOW RESERVATIONS Page (for Customer use)
app.get('/user/show-reservations-customer', isAuthenticated, async (req, res) => {
    try {
        if (req.session.user.role !== 'customer') {
            return res.status(403).send({ error: 'Access denied' });
        }

        // Fetch reservations based on userId
        const reservations = await Reservation.find({ user_id: req.session.user.id })
            .populate('restaurant_id', 'name')
            .sort({ reservation_datetime: -1 })
            .lean();

        // Format the dates before rendering
        reservations.forEach(reservation => {
            reservation.reservation_datetime = new Date(reservation.reservation_datetime).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        });

        res.render('userCustomerReservation.hbs', { reservations });
    } catch (error) {
        console.error('Error retrieving customer reservations:', error);
        throw error;
    }
});

// SHOW RESERVATIONS Page (for Restaurant use)
app.get('/user/show-reservations-restaurant', isAuthenticated, async (req, res) => {
    try {
        if (req.session.user.role !== 'restaurant') {
            return res.status(403).send({ error: 'Access denied' });
        }

        // Get today and tomorrow's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 2); // End of tomorrow

        const restaurant = await Restaurant.findOne({ account: req.session.user.id });
        if (!restaurant) {
            return res.status(400).send({ error: 'Restaurant data not found' });
        }

        // Fetch reservations based on restaurantId and date
        // User.customer name and phoneNumber also saved to reservations object
        const reservations = await Reservation.find({
            restaurant_id: restaurant._id,
            reservation_datetime: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .populate('user_id', 'name phoneNumber')
            .sort({ reservation_datetime: 1 })
            .lean();

        // Format the dates before rendering
        reservations.forEach(reservation => {
            reservation.reservation_datetime = new Date(reservation.reservation_datetime).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        });

        res.render('userRestaurantReservation.hbs', { reservations });
    } catch (error) {
        console.error('Error retrieving restaurant reservations:', error);
        throw error;
    }
});

// SHOW RESTAURANT ITEMS Page
app.get('/user/modify-items', isAuthenticated, async(req, res) => {
    try {
        // Get the restaurant ID from the session
        const restaurantId = req.session.user.restaurantId;

        // Fetch the restaurant details by id
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.error('Restaurant not found');
            return res.status(404).send('Restaurant not found');
        }

        // Fetch the items from MENU collections filter by restaurantId
        const menu = await Menu.findOne({ restaurant_id: restaurantId }).populate('items');
        if (!menu) {
            console.error('Menu not found for restaurantId:', restaurantId);
            return res.status(404).send('Menu not found');
        }

        res.render('restaurantItems', { restaurant, items: menu.items });
    } catch (err) {
        console.error('Error loading modify items page:', err);
        res.status(500).send('Error loading modify items page');
    }
});

// SELECT RESTAURANT Page
app.get('/select-restaurant', isAuthenticated, async(req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.render('selectRestaurant', { restaurants });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ORDER Page
app.get('/create-order', isAuthenticated,  async (req, res) => {
    const restaurantId = req.query.restaurantId;
    req.session.user.restaurantId = restaurantId;

    try {
        // Fetch restaurant details by restaurantId
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.error('Restaurant not found');
            return res.status(404).send('Restaurant not found');
        }

        // Fetch menu by restaurantId
        const objectId = new mongoose.Types.ObjectId(restaurantId);
        const menu = await Menu.findOne({ restaurant_id: objectId }).populate('items');
        if (!menu) {
            console.error('Menu not found for restaurantId:', restaurantId);
            return res.status(404).send('Menu not found');
        }

        res.render('appOrder', { restaurant, items: menu.items });
    } catch (err) {
        console.error('Error loading order page:', err);
        res.status(500).send('Error loading order page');
    }
});

// ==============================
// API CALLS
// ==============================

// Call route to validate login credentials
app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // Find user.custoer first with their EMAIL
        let user = await User.findOne({ email: identifier });

        // NO USER -- find user.restaurant with their user/email
        if (!user) {
            user = await User.findOne({ username: identifier });
            if (!user) {
                return res.status(400).send({ error: 'Invalid credentials' });
            }
        }

        // Check if user credentials (password) matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        // *** Can be turned into function ***
        // Initialize session data for future use
        const sessionData = {
            id: user._id,
            email: user.email.toLowerCase(),
            username: user.username.toLowerCase(),
            name: user.name,
            address: user.address,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };

        // If user is a restaurant, fetch alias field data from the restaurants collection
        // user.alias and user.restaurantId needed for some functions
        if (user.role === 'restaurant') {
            const restaurant = await Restaurant.findOne({ account: user._id });
            if (restaurant) {
                sessionData.alias = restaurant.alias.toLowerCase();
                sessionData.restaurantId = restaurant._id;
            } else {
                return res.status(400).send({ error: 'Restaurant data not found' });
            }
        }

        // Save session data
        req.session.user = sessionData;

        res.status(200).json({ message: 'Login successful!' });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Call route when user logs out
app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'Error logging out' });
        }
        res.redirect('/logout-success');
    });
});

// Call route when a user registers a new account
app.post('/api/register', async(req, res) => {
    const { name, email, password, address, phone } = req.body;
    try {

        // *** Can be turned into function? ***
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        // Save new user into a variable -- to be saved
        const newUser = new User({
            email: email.toLowerCase(),
            username: email.toLowerCase(),
            password: hashedPassword,
            name: name,
            address: address,
            phoneNumber: phone,
            role: 'customer' });

        // If no errors -- save information
        await newUser.save();
        res.status(200).json({ message: 'Registration successful!' });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error code
            res.status(400).json({ error: 'Email already registered.' });
        } else {
            res.status(500).json({ error: 'Error registering user.' });
        }
    }
});

// Call route when ORDER NOW is clicked
app.post('/api/submit-order', isAuthenticated, async (req, res) => {
    try {

        // Get info from req.body
        const { user_id, restaurant_id, items, total_price, pickup_time } = req.body;

        // All fields must be filled
        if (!user_id || !restaurant_id || !items || !total_price || !pickup_time) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Save new order into a variable -- to be saved
        const newOrder = new Order({
            user_id,
            restaurant_id,
            items,
            total_price,
            pickup_time,
            status: 'Preparing'
        });

        // Save new order
        await newOrder.save();

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});


// Call when user.customer profile is updated
// Works for singular or multiple field modifications
app.post('/api/update-profile', isAuthenticated, async (req, res) => {
    try {
        // Get info
        const userId = req.session.user.id;
        const { field, value } = req.body;

        // Info must be valid
        if (!userId || !field || value === undefined) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        // Works on any field -- name, phoneNumber, address, etc
        const update = { [field]: value };
        const user = await User.findByIdAndUpdate(userId, update, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update current session data
        req.session.user[field] = value;

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Call route when user.restaurant changes [Status] of :orderId
app.post('/api/update-order-status/:orderId', isAuthenticated, async (req, res) => {
    // Get info
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        // Fetch order details by orderId
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Save new status information to MongoDB
        order.status = status;
        await order.save();

        res.status(200).json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Call route when user.restaurant edits their dish price
app.post('/api/edit-item/:itemId', isAuthenticated, async (req, res) => {
    // Get info
    const { itemId } = req.params;
    const { price } = req.body;

    try {
        // Fetch item details by itemId
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Save new price to MongoDB
        item.price = price;
        await item.save();

        res.status(200).json({ success: true, message: 'Item price updated successfully' });
    } catch (error) {
        console.error('Error updating item price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Call route when user.restaurant deletes one of their item/dish
app.delete('/api/delete-item/:itemId', isAuthenticated, async (req, res) => {
    // Get info
    const { itemId } = req.params;

    try {
        // Find the item by its ID and delete it
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Call route when user.customer is creating a new reservation
app.post('/api/create-reservation', async (req, res) => {
    try {
        // Save info to some variables
        const restaurantId = req.session.user.restaurantId;
        const userId = req.session.user.id;
        const { date, time, number_of_guests } = req.body;

        // Combine date and time into a single Date object
        const reservation_datetime = new Date(`${date}T${time}:00`);

        // Create the reservation
        const newReservation = new Reservation({
            restaurant_id: restaurantId,
            user_id: userId,
            reservation_datetime,
            number_of_guests,
        });

        // Save the reservation
        await newReservation.save();

        res.status(200).json({ success: true, message: 'Reservation successfully saved.' });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ success: false, message: 'Error saving reservation.' });
    }
});

// ==============================
// 404 -- Page not found
// ==============================
// Handle undefined webpages
app.get('*', (req, res, next) => {
    res.status(404).send('Sorry, the page you are looking for does not exist.');
});