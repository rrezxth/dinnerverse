# Welcome to Dinnerverse!

___
**DESCRIPTION:** This web application allows users to create pick-up orders,
manage reservations at various restaurants. It supports restaurants ability to view orders, 
reservations and manually edit their dish information from the menu.

**TECHNOLOGY:** This project utilizes Node.js with Express for server-side logic, Bootstrap for the UI Framework,
MongoDB for data persistence and Handlebars for templating. User Authentication is handled 
by using bcrypt.
___
## *Route Documentation*
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
- Purpose 1: Displays past and current customer orders.
- Purpose 2: Allows restaurants to change status of customers' orders.

### User-Customer Reservation Page
- Path: /user/show-reservations-customer
- Method: GET
- Auth Required: Yes
- Rendered Template: userCustomerReservation.hbs
- Purpose: Displays past and current customer reservations.

### User-Restaurant Reservation Page
- Path: /user/show-reservations-restaurant
- Method: GET
- Auth Required: Yes
- Rendered Template: userRestaurantReservation.hbs
- Purpose: Displays today and tomorrow's reservations.

### User-Restaurant Edit Items Page
- Path: /user/modify-items
- Method: GET
- Auth Required: Yes
- Rendered Template: restaurantItems.hbs
- Purpose 1: Displays current restaurant menu items.
- Purpose 2: Allows restaurants to change the price of their items.
___
## *API Documentation*
### Login API
- Endpoint: /api/login
- Method: POST
- Auth Required: No
- Parameters:
- - 'identifier': Email or username (String)
- - 'password': Password (String)
- Response:
- - Success: { message: 'Login successful!' } (200 OK)
- - Failure: { error: 'Invalid credentials' } (400 Bad Request)
- Purpose: Verifies user credentials and initiates a session.

### Logout API
- Endpoint: /api/logout
- Method: POST
- Auth Required: Yes
- Response:
- - Success: Redirects to '/logout-successful' (200 OK)
- - Failure: { error: 'Invalid credentials' } (400 Bad Request)
- Purpose: Destroy's user session and logs them out.

### Register API
- Endpoint: /api/register
- Method: POST
- Auth Required: No
- Parameters:
- - 'name': Full name (String)
- - 'password': Password (String)
- - 'email': Email address (String, unique)
- - 'address': Home address (String)
- - 'phone': Phone number (String)
- Response:
- - Success: { message: 'Registration successful!' } (200 OK)
- - Failure: { error: 'Email already registered.' } or other errors (400/500 codes)
- Purpose: Registers a new user and stores their information securely.

### Submit Order API
- Endpoint: /api/submit-order
- Method: POST
- Auth Required: Yes
- Parameters:
- - 'user_id': ID of the user placing the order (String)
- - 'restaurant_id': ID of the restaurant (String)
- - 'items': List of items ordered (Array)
- - 'total_price': Total price of the order (Number)
- - 'pickup_time': Scheduled pickup time (String, ISO8601 Date format)
- Response:
- - Success: { message: 'Order created successfully', order: [Order Details] } (201 Created)
- - Failure: { error: 'All fields are required' } or server errors (400/500 codes)
- Purpose: Processes a new order and saves it to the database.

### Update Profile API
- Endpoint: /api/update-profile
- Method: POST
- Auth Required: Yes
- Parameters:
- - 'field': Field to update (e.g., name, address) (String)
- - 'value': New value for the field (Varies)
- Response:
- - Success: { success: true, data: [Updated User Info] } (200 OK)
- - Failure: { success: false, message: 'Invalid input' } or not found (400/404 codes)
- Purpose: Allows users to update their profile information.

### Update Order Status API
- Endpoint: /api/update-order-status/:orderId
- Method: POST
- Auth Required: Yes
- Parameters:
- - 'orderId': ID of the order to update (URL parameter)
- - 'status': New status of the order (String)
- Response:
- - Success: { success: true, message: 'Order status updated' } (200 OK)
- - Failure: { error: 'Order not found' } or server errors (404/500 codes)
- Purpose: Updates the status of an existing order in the database.

### Edit Item API
- Endpoint: /api/edit-item/:itemId
- Method: POST
- Auth Required: Yes
- Parameters:
- - 'itemId': ID of the item to edit (URL parameter)
- - 'price': New price of the item (Number)
- Response:
- - Success: { success: true, message: 'Item price updated successfully' } (200 OK)
- - Failure: { error: 'Item not found' } or server errors (404/500 codes)
- Purpose: Allows restaurant users to update the price of a menu item.

### Delete Item API
- Endpoint: /api/delete-item/:itemId
- Method: DELETE
- Auth Required: Yes
- Parameters:
- - 'itemId': ID of the item to delete (URL parameter)
- Response:
- - Success: { success: true, message: 'Item deleted successfully' } (200 OK)
- Purpose: Permanently removes an item from the database.

### Create Reservation API
- Endpoint: /api/create-reservation
- Method: POST
- Auth Required: Yes
- Parameters:
- - 'date': The date of the reservation (String, format: YYYY-MM-DD)
- - 'time': The time of the reservation (String, format: HH:MM)
- - 'number_of_guests': The number of guests for the reservation (Integer)
- Response:
- - Success: { success: true, message: 'Reservation successfully saved.' } (200 OK)
- - Failure: { success: false, message: 'Error saving reservation.' } (500 Internal Server Error)
- Purpose: Allows users customer to create a new reservation for a specific restaurant and date.
___
## *Model Documentation*
### User Model
- email: String, required, unique
- password: String, required
- name: String, required
- address: String, required
- phoneNUmber: String, required, 
- username: String, required, [restaurants-only]
- role: String, required, [can only be 'customer' or 'restaurant']

### Restaurant Model
- account: ObjectId, a reference to 'User' schema, represents account linked to restaurant
- address: String, required
- name: String, required
- phoneNUmber: String, required,
- alias: String, required, [an alternative name of the restaurant]

### Menu Model
- restaurant_id: ObjectId, a reference to 'Restaurant' schema, represents the menu's link to the restaurant
- items: Array, required, [an array of dish items]
- name: String, required

### Item Model
- menu_id: ObjectId, a reference to the 'Menu' schema, represents the item's link to the menu
- description: String, required
- name: String, required
- price: Number, required
- alias: String, required, [an alternative name of the item]
- photo: String, optional [currently unused]

### Order Model
- user_id: ObjectId, a reference to 'User' schema, represents the order's link to user
- restaurant_id: ObjectId, a reference to 'Restaurant' schema, represents the order's link to restaurant
- items: Array, required
- - item_id: ObjectId, a reference to 'Item' schema
- - name: String, required
- - quantity: Number, required
- - price: Number, required
- total_price: Number, required
- status: String, required
- pickup_time: Date, required

### Reservation Model
- user_id: ObjectId, a reference to 'User' schema, represents the reservation's link to user
- restaurant_id: ObjectId, a reference to 'Restaurant' schema, represents the reservation's link to restaurant
- reservation_datetime: Date, required
- number_of_guests: Number, required

___
## Changelog
Version 1.0 [Initial Release Date]: Initial deployment of the application with core functionalities.