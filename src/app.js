// ==============================
// CONFIGURATIONS
// ==============================
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();
//const {connectToMongo} = require("./dbConfig");

// ==============================
// MIDDLEWARES
// ==============================
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "../views/layouts"),
    partialsDir: path.join(__dirname, "../views/partials")
}));app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../views'));

// ==============================
// PORT CONNECTION -- MONGODB HERE
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening in PORT: ${PORT}`));

// ==============================
// ROUTE HANDLERS
// ==============================

// HOME
app.get("/", (req, res) => {
    res.render('index');
});
/*
app.get("/order", (req, res) => {
    res.render('appOrder');
});
*/

app.get("/login", (req, res) => {
    res.render('loginPage');
});

app.get("/register", (req, res) => {
    res.render('registerPage.hbs');
});

app.get("/order", (req, res) => {

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