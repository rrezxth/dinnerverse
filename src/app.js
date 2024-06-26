// ==============================
// CONFIGURATIONS
// ==============================
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

//const jwt = require('jsonwebtoken');
//const jwtSecret = process.env.JWT_SECRET;
//const cookieParser = require('cookie-parser');


//// IMPORT from directory
require('dotenv').config({ path: '../.env' });
const {connectToMongo} = require("./database/dbconfig");
const User = require('./database/model/userModel');

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
    partialsDir: path.join(__dirname, "../views/partials")
}));app.set('view engine', '.hbs');
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

// HOME
app.get('/', (req, res) => {
    res.render('index');
});
/*
app.get("/order", (req, res) => {
    res.render('appOrder');
});
*/

app.get('/login', (req, res) => {
    res.render('loginPage');
});

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // Find user first with their EMAIL
        let user = await User.findOne({ email: identifier });

        // NO USER -- find restaurant with their USER
        if (!user) {
            user = await User.findOne({ username: identifier });
            if (!user) {
                return res.status(400).send({ error: 'Invalid credentials 1' });
            }
        } else {
            console.log('USER FOUND');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials 2' });
        }

        console.log('Credentials CORRECT!');

        req.session.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            name: user.name,
            address: user.address,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };

        res.redirect('/');
    } catch (err) {
        res.status(400).send({ error: 'Error logging in' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'Error logging out' });
        }
        res.redirect('/');
    });
});

app.get('/register', (req, res) => {
    res.render('registerPage.hbs');
});

app.get('/order', (req, res) => {

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
});