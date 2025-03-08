document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("productId");
    const quantity = parseInt(urlParams.get("quantity")) || 1;
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
        alert("Please log in to proceed with checkout.");
        window.location.href = "../HTML/sign-in.php";
        return;
    }

    if (productId) {
        //If "Buy Now" was clicked, fetch only 1 product
        await fetchBuyNowItem(productId, quantity);
    } else {
        //If checkout is from the cart, fetch all cart items
        await fetchCartItems();
    }

    document.querySelector(".confirm-btn").addEventListener("click", checkout);
});

//Fetch single product (for Buy Now)
async function fetchBuyNowItem(productId, quantity) {
    try {
        const response = await fetch("http://localhost/jmab/final-jmab/api/products");
        const data = await response.json();

        if (data.success) {
            const product = data.products.find(p => String(p.product_id) === String(productId));
            if (product) {
                displaySelectedItems([{ ...product, quantity }]); 
                updateOrderSummary(product.price, quantity);
            } else {
                document.getElementById("selected-items-container").innerHTML = "<p>Product not found.</p>";
            }
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        document.getElementById("selected-items-container").innerHTML = "<p>Failed to load product.</p>";
    }
}

//Fetch multiple cart items (for normal checkout)
async function fetchCartItems() {
    try {
        const response = await fetch(`http://localhost/jmab/final-jmab/api/carts/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        console.log("Cart Data:", data);

        if (data.success && data.cart.length > 0) {
            displaySelectedItems(data.cart);
            updateOrderSummaryFromCart(data.cart);
        } else {
            document.getElementById("selected-items-container").innerHTML = "<p>Your cart is empty.</p>";
        }
    } catch (error) {
        console.error("Error fetching cart items:", error);
        document.getElementById("selected-items-container").innerHTML = "<p>Failed to load cart items.</p>";
    }
}

function displaySelectedItems(items) {
    const container = document.getElementById("selected-items-container");
    container.innerHTML = ""; // Clear previous items

    items.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("selected-item");
        itemElement.innerHTML = `
            <img src="${item.image_url || '../imahe/default-image.png'}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>Brand: ${item.brand || 'N/A'}</p>
                <p>Price: ₱${parseFloat(item.price).toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

//Update Order Summary
function updateOrderSummary(price, quantity) {
    const subtotal = price * quantity;
    document.getElementById("subtotal").textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `₱${(subtotal + 50).toFixed(2)}`;
}

function updateOrderSummaryFromCart(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
    document.getElementById("subtotal").textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `₱${(subtotal + 50).toFixed(2)}`;
}

//Checkout Function
async function checkout() {
    const shippingInfo = {
        full_name: document.getElementById("full-name").value,
        address: document.getElementById("address").value,
        payment_method: document.getElementById("payment-method").value
    };

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("productId");
    const quantity = parseInt(urlParams.get("quantity")) || 1;
    let orderData;

    if (productId) {
        // "Buy Now" Order
        orderData = {
            user_id: userId,
            items: [{ product_id: productId, quantity: quantity }],
            shipping_info: shippingInfo
        };
    } else {
        // Cart Checkout Order
        const cartResponse = await fetch(`http://localhost/jmab/final-jmab/api/carts/${userId}`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const cartData = await cartResponse.json();

        if (!cartData.success || !cartData.cart.length) {
            alert("Your cart is empty.");
            return;
        }

        orderData = {
            user_id: userId,
            items: cartData.cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            shipping_info: shippingInfo
        };
    }

    // Place Order
    const response = await fetch("http://localhost/jmab/final-jmab/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
        alert("Order placed successfully!");

        if (!productId) {
            await fetch(`http://localhost/jmab/final-jmab/api/carts/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${authToken}` }
            });
        }

        window.location.href = "order-confirmation.html";
    } else {
        alert(result.errors ? result.errors.join(", ") : "Failed to place order.");
    }
}
