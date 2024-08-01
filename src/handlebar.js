const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');

// Register helpers directly with Handlebars
Handlebars.registerHelper('times', function (n, block) {
    let accum = '';
    for (let i = 1; i <= n; i++) {
        accum += block.fn(i);
    }
    return accum;
});
Handlebars.registerHelper('nextPage', function (n, block) {
    return Number(n) + 1;
});
Handlebars.registerHelper('prevPage', function (n, block) {
    return Number(n) - 1;
});
Handlebars.registerHelper('ifnext', function (currentPage, endPage, block) {
    if (Number(currentPage) >= Number(endPage)) {
        return 'disabled';
    } else {
        return false;
    }
});
Handlebars.registerHelper('ifprev', function (currentPage, block) {
    if (Number(currentPage) <= 1) {
        return 'disabled';
    } else {
        return false;
    }
});
Handlebars.registerHelper('active', function (active, currentPage, block) {
    if (active == currentPage) {
        return 'active';
    } else {
        return false;
    }
});
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context).replace(/"/g, '&quot;');
});
Handlebars.registerHelper('discount', function (price, discount, block) {
    let discountPrice = parseFloat(price - ((price * discount) / 100)).toFixed(2);
    return discountPrice;
});
Handlebars.registerHelper('ifStates', function (states, id, block) {
    if (states == "NA") {
        return '<td><a href="/admin/cooking/' + id + '" class="btn states-btn btn-outline-success btn-sm">Cooking</a></td>';
    } else if (states == "Cooking") {
        return '<td><a href="/admin/deliver/' + id + '" class="btn states-btn btn-outline-warning btn-sm ">Deliver</a></td>';
    } else if (states == "Out for deliver.") {
        return '<td><a href="/admin/handover/' + id + '" class="btn states-btn btn-outline-danger btn-sm">Handover</a></td>';
    } else {
        return '<td><a class="btn btn-outline-dark states-btn btn-sm disabled">Completed</a></td>';
    }
});
Handlebars.registerHelper('ifCancelOrder', function (states, id, block) {
    if (states == "NA") {
        return '<a href="/user/cancelOrder/' + id + '" class="main-btn">Cancel order</a>';
    }
});
Handlebars.registerHelper('eq', function (v1, v2) {
    return v1 === v2;
});



const hbs = exphbs.create({
    extname: '.hbs',
    handlebars: Handlebars
});

module.exports = hbs;
