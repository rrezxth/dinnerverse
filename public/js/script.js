// Reset 'cart' data
function resetCart() {
    localStorage.setItem("cart", JSON.stringify([]));
    updateCart();
}

// Called when user adds an item to their cart
function addFoodToBasket(did, dname, dprice, dimage) {
    let cart = localStorage.getItem("cart");
    let products;

    if (cart === null) {
        products = [];
    } else {
        products = JSON.parse(cart);
    }

    const existingProduct = products.find((item) => item.id === did);

    if (existingProduct) {
        products = products.map((item) => {
            if (item.id === existingProduct.id) {
                item.quantity++;
            }
            return item;
        });
    } else {
        const newProduct = {
            id: did,
            name: dname,
            price: dprice,
            image: dimage,
            quantity: 1
        };
        products.push(newProduct);
    }

    localStorage.setItem("cart", JSON.stringify(products));
    // Call sweetalert2
    displayNotification("Item added successfully.");
    // Update cart to reload with new data
    updateCart();
}

// Can be called when a notification is needed
function displayNotification(message) {
    Swal.fire({
        toast: true,
        background: "#ecb649",
        html: `<h6 class='text-light text-small px-1'>${message}</h6>`,
        position: "bottom",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });
}

// Updates the cart -- call after adding or deleting items
function updateCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart === null || cart.length === 0) {
        $(".cart-num").html("( 0 )");
        $(".cart-body").html("Your cart is empty!");
        $(".order-btn").addClass("disabled");
    } else {
        $(".cart-num").html(`( ${cart.length} )`);
        $(".order-btn").removeClass("disabled");

        let table = `
            <table class="table table-hover">
                <tr class="text-style">
                    <th>Pic</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
        `;

        let totalPrice = 0;
        const taxRate = 0.13;
        let taxPrice = 0;
        cart.forEach((item) => {
            table += `
                <tr>
                    <td><img style='width:50px;height:50px;border-radius:50%' src='/image${item.image}'/></td>
                    <td><small>${item.name}</small></td>
                    <td><small>${item.price}</small></td>
                    <td><small>${item.quantity}</small></td>
                    <td><small>${item.price * item.quantity}</small></td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeBook('${item.id}')">Remove</button></td>
                </tr>
            `;
            totalPrice += item.price * item.quantity;
            // 5 Cents denomination
            //totalPrice = Math.round(totalPrice * 20) / 20;
            taxPrice = Math.round(totalPrice * taxRate * 100) / 100;
            taxPrice = taxPrice.toFixed(2);

        });

        table += `
            <tr>
                <td colspan="6" class="my-2">Total Price: $${totalPrice} (+ $${taxPrice} tax)</td>
            </tr>
            </table>
        `;
        $(".cart-body").html(table);
    }
}

function removeBook(id) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

/*
=================================
=================================
*/

async function handleOrderNowButtonClick(user_id, restaurant_id) {
    // Close the modal
    var modalElement = document.getElementById("staticBackdrop");
    var modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // Get cart data
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (!cart || cart.length === 0) {
        Swal.fire('Cart is empty', 'Please add items to the cart before ordering.', 'error');
        return;
    }

    // Pickup time (40 minutes from now)
    const currentTime = new Date();
    const pickup_time = new Date(currentTime.getTime() + 40 * 60000);

    // Tax rate
    const tax_rate = 1.13;

    // Calculate total price w/ tax
    const total_price = Math.round(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * tax_rate * 100) / 100;
    // Prepare order data
    const orderData = {
        user_id,
        restaurant_id,
        items: cart.map(item => ({
            item_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total_price,
        pickup_time
    };

    // Uses API submit-order to add the order to MongoDB
    try {
        const response = await fetch('/api/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Order created successfully:', result);

            resetCart();

            // Show notification
            Swal.fire({
                icon: "success",
                title: "Order has been placed.",
                text: "Thank you for your order!",
                timer: 4000,
                timerProgressBar: true
            });
        } else {
            console.error('Failed to create order');
            Swal.fire('Order Failed', 'There was a problem creating your order. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Order Failed', 'There was an error processing your order. Please try again.', 'error');
    }
}
