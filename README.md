# Welcome to Dinnerverse!

___
**Description:** This web application allows users to create pick-up orders,
manage reservations at various restaurants. It supports restaurants ability to view orders, 
reservations and manually edit their dish information from the menu.

**Technology:** This project utilizes Node.js with Express for server-side logic, 
MongoDB for data persistence and Handlebars for templating. User Authentication is handled 
by using bcrypt.
___
## *Routes*
### Home Page

- Path: /
- Method: GET
- Auth Required: No
- Rendered Template: index.hbs
- Purpose: Displays the home page of the website.

### Login Page
- Path: /login
- Method: GET
- Auth Required: No
- Rendered Template: loginPage.hbs
- Purpose: Provides a user interface for logging into the system.

### Logout Page
- Path: /logout-success
- Method: GET
- Auth Required: No
- Rendered Template: logoutPage.hbs
- Purpose: Displays a confirmation of successful logout.

### Register Page
- Path: /register
- Method: GET
- Auth Required: No
- Rendered Template: registerPage.hbs
- Purpose: Provides a form for new users to register.

### Select Restaurant Page
- Path: /select-restaurant
- Method: GET
- Auth Required: Yes
- Rendered Template: selectRestaurant.hbs
- Purpose: Displays available restaurants to the customer.

### Order Page
- Path: /create-order
- Method: GET
- Auth Required: Yes
- Rendered Template: appOrder.hbs
- Purpose: Displays available restaurants to the customer.

### User Profile Page
- Path: /user/profile
- Method: GET
- Auth Required: Yes
- Rendered Template: userProfile.hbs
- Purpose: Displays the profile information of the logged-in user (be it restaurant or customer).

### User View Order Page
- Path: /user/retrieve-orders
- Method: GET
- Auth Required: Yes
- Rendered Template: userOrder.hbs
- Purpose 1:
- Purpose 2: 







___
### Changelog
Version 1.0 [Initial Release Date]: Initial deployment of the application with core functionalities.