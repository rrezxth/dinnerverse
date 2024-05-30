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
    layoutsDir: path.join(__dirname, "../views")
}));app.set('view engine', '.hbs');
app.set('views', '../views');

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