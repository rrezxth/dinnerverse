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