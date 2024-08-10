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

//const jwt = require('jsonwebtoken');
//const jwtSecret = process.env.JWT_SECRET;
//const cookieParser = require('cookie-parser');


//// IMPORT from directory  
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const {connectToMongo} = require("./database/dbconfig");
const User = require('./database/model/userModel');
const Restaurant = require('./database/model/restaurantModel');
const Menu = require('./database/model/menuModel');
const Item = require('./database/model/itemModel');
const Order = require('./database/model/orderModel');

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

app.get('/clear-unauthorized-message', (req, res) => {
    req.session.unauthorizedMessage = null;
    res.sendStatus(200);
});


// LOGIN Page
app.get('/login', (req, res) => {
    const unauthorizedMessage = req.session.unauthorizedMessage;
    req.session.unauthorizedMessage = null; // Clear the message after fetching it
    res.render('loginPage.hbs', { unauthorizedMessage });
});


// LOGOUT Page
app.get('/logout-success', (req, res) => {
    res.render('logoutPage.hbs');
});

// REGISTER Page
app.get('/register', (req, res) => {
    res.render('registerPage.hbs');
});

// USER PROFILE Page
app.get('/user/profile', isAuthenticated, (req, res) => {
    res.render('userProfile.hbs');
});

// USER RECENT ORDERS Page
app.get('/user/retrieve-orders/', isAuthenticated, async (req, res) => {
    try {
        let orders;

        if (req.session.user.role === 'customer') {
            // Fetch orders for customers
            orders = await Order.find({ user_id: req.session.user.id })
                .populate('restaurant_id', 'name')
                .populate('items.item_id', 'name')
                .sort({ createdAt: -1 })
                .lean();
        } else if (req.session.user.role === 'restaurant') {
            // Fetch orders for restaurants
            const restaurant = await Restaurant.findOne({ account: req.session.user.id });
            if (restaurant) {
                orders = await Order.find({ restaurant_id: restaurant._id })
                    .populate('user_id', 'name email') // Populate customer info
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


// SELECT RESTAURANT Page
app.get('/select-restaurant', isAuthenticated, async(req, res) => {
    const restaurants = await Restaurant.find();
    res.render('selectRestaurant', { restaurants });
});

// ORDER Page
app.get('/create-order', isAuthenticated,  async (req, res) => {
    const restaurantId = req.query.restaurantId;

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.error('Restaurant not found');
            return res.status(404).send('Restaurant not found');
        }

        // Get menu
        const objectId = new mongoose.Types.ObjectId(restaurantId);
        const menu = await Menu.findOne({ restaurant_id: objectId }).populate('items');
        if (!menu) {
            console.error('Menu not found for restaurantId:', restaurantId);
            return res.status(404).send('Menu not found');
        }

        // Render order page with the selected restaurant and menu items
        res.render('appOrder', { restaurant, items: menu.items });
    } catch (err) {
        console.error('Error loading order page:', err);
        res.status(500).send('Error loading order page');
    }
});

// ==============================
// API CALLS
// ==============================

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // Find user first with their EMAIL
        let user = await User.findOne({ email: identifier });

        // NO USER -- find restaurant with their USER
        if (!user) {
            user = await User.findOne({ username: identifier });
            if (!user) {
                return res.status(400).send({ error: 'Invalid credentials' });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

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
        if (user.role === 'restaurant') {
            const restaurant = await Restaurant.findOne({ account: user._id });
            if (restaurant) {
                sessionData.alias = restaurant.alias.toLowerCase();
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

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'Error logging out' });
        }
        res.redirect('/logout-success');
    });
});


app.post('/api/register', async(req, res) => {
    const { name, email, password, address, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email: email.toLowerCase(),
            username: email.toLowerCase(),
            password: hashedPassword,
            name: name,
            address: address,
            phoneNumber: phone,
            role: 'customer' });
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

app.get('/api/available-restaurants', isAuthenticated, async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching restaurants', error: err });
    }
});

app.post('/api/submit-order', isAuthenticated, async (req, res) => {
    try {
        const { user_id, restaurant_id, items, total_price, pickup_time } = req.body;

        if (!user_id || !restaurant_id || !items || !total_price || !pickup_time) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newOrder = new Order({
            user_id,
            restaurant_id,
            items,
            total_price,
            pickup_time,
            status: 'Preparing' // Default
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.post('/api/update-profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { field, value } = req.body;

        if (!userId || !field || value === undefined) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const update = { [field]: value };
        const user = await User.findByIdAndUpdate(userId, update, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update session data
        req.session.user[field] = value;

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/update-order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
