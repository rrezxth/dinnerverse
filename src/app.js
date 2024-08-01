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

// LOGIN Page
app.get('/login', (req, res) => {
    res.render('loginPage');
});

// LOGOUT Page
app.get('/logout-success', (req, res) => {
    res.render('logoutPage');
});

// REGISTER Page
app.get('/register', (req, res) => {
    res.render('registerPage.hbs');
});

// USER PROFILE Page
app.get('/user/profile', (req, res) => {
    res.render('userProfile.hbs');
});

// USER RECENT ORDERS Page
app.get('/user/orders', (req, res) => {
    res.render('userOrder.hbs');
});

// SELECT RESTAURANT Page
app.get('/select-restaurant', async(req, res) => {
    const restaurants = await Restaurant.find();
    res.render('selectRestaurant', { restaurants });
});

// ORDER Page
app.get('/order', async (req, res) => {
    const restaurantId = req.query.restaurantId;
    console.log('Received restaurantId:', restaurantId);

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

        // Log the items for debugging purposes
        console.log('Menu items:', menu.items);

        // Render order page with the selected restaurant and menu items
        res.render('appOrder', { restaurant, items: menu.items });
    } catch (err) {
        console.error('Error loading order page:', err);
        res.status(500).send('Error loading order page');
    }

    /*
    // TODO: Should be from database (using mongoose)
    const dummyFoods = [
        {
            _id: "1",
            dname: "Gravy Chicken",
            dprice: "12.99",
            photo: "gravy_chicken.jpg"
        },
        {
            _id: "2",
            dname: "Chow Mein (Singaporean Noodles)",
            dprice: "12.99",
            photo: "chow_mein.jpg"
        },
        {
            _id: "3",
            dname: "Squid Calamari",
            dprice: "13.99",
            photo: "squid_calamari.jpeg"
        },
        {
            _id: "4",
            dname: "Spring Rolls (Veggies)",
            dprice: "8.99",
            photo: "spring_rolls_veggies.jpg"
        },
        {
            _id: "5",
            dname: "Assorted Fried Rice *House Special*",
            dprice: "15.99",
            photo: "assorted_fried_rice.jpg"
        },
        {
            _id: "6",
            dname: "Beef with Brocolli",
            dprice: "13.99",
            photo: "beef_broccoli.jpg"
        }
    ];

    res.render('appOrder', { foods: dummyFoods });
    */
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
        } else {
            console.log('USER FOUND');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            name: user.name,
            address: user.address,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };

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
            email: email,
            username: email,
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

app.get("/api/yourOrder", async (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    try {
        const orders = await Order.find({ user_id: user.id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});

app.get('/api/available-restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching restaurants', error: err });
    }
});
