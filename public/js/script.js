console.log("/script/.js is active");

// DEVELOPMENT ONLY
function resetCart() {
    localStorage.setItem("cart", JSON.stringify([]));
    updateCart();
}

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
    displayNotification("Item added successfully.");
    updateCart();
}

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
        });

        table += `
            <tr>
                <td colspan='3' class='my-2 '>Total Price: ${totalPrice}</td>
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

    // Pickup time (40 minutes from now)
    const currentTime = new Date();
    const pickup_time = new Date(currentTime.getTime() + 40 * 60000);

    // Get cart data
    const cart = JSON.parse(localStorage.getItem("cart"));
    const total_price = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Prepare order data
    const orderData = {
        user_id,
        restaurant_id,
        items: cart.map(item => ({
            item_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        total_price,
        pickup_time
    };

    // DEBUG
    console.log(orderData);

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

            // Show notif
            Swal.fire({
                icon: "success",
                title: "Order has been placed.",
                text: "Thank you for your order!",
                timer: 4000,
                timerProgressBar: true
            });
        } else {
            console.error('Failed to create order');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


/*
function handleOrderNowButtonClick() {
    // Close the modal
    var modalElement = document.getElementById("staticBackdrop");
    var modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    resetCart();

    // Show the SweetAlert notification
    Swal.fire({
        toast: true,
        background: "#03AC13",
        html: "<h6 class='text-light text-small px-1'>Thank you for your order!</h6>",
        position: "bottom",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });
}
*/