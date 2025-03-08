document.addEventListener("DOMContentLoaded", () => {
    fetchUserCart();

    // Checkout button listener
    const checkoutButton = document.querySelector(".checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            window.location.href = "../HTML/checkout.html";
        });
    }

    // Select All checkbox listener
    const selectAllCheckbox = document.getElementById("select-all");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", toggleSelectAll);
    }

    // Delete Selected Items button
    const deleteButton = document.querySelector(".delete-btn");
    if (deleteButton) {
        deleteButton.addEventListener("click", removeSelectedItems);
    }
});

// ✅ Fetch and display user's cart
async function fetchUserCart() {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
        alert("Please log in to view your cart.");
        window.location.href = "../HTML/sign-in.php";
        return;
    }

    try {
        const response = await fetch(`http://localhost/jmab/final-jmab/api/carts/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Cart Data:", data);

        if (data.success && data.cart.length > 0) {
            displayCartItems(data.cart);
        } else {
            document.querySelector(".cart-items-container").innerHTML = "<h3>Your cart is empty.</h3>";
        }
    } catch (error) {
        console.error("Error fetching cart:", error);
        alert("An error occurred while retrieving your cart. Please try again.");
    }
}

// ✅ Display cart items
function displayCartItems(cartItems) {
    const cartItemsContainer = document.querySelector(".cart-items-container");
    if (!cartItemsContainer) {
        console.error("Cart items container not found.");
        return;
    }

    cartItemsContainer.innerHTML = ""; // Clear existing items

    cartItems.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.dataset.cartId = item.cart_id;

        cartItem.innerHTML = `
            <input type="checkbox" class="item-checkbox">
            <div class="item-details">
                <img src="${item.product_image || 'https://via.placeholder.com/100'}" alt="${item.product_name}">
                <div class="item-info">
                    <h3>${item.product_name}</h3>
                    <p>Brand: ${item.product_brand || "Unknown"}</p>
                </div>
            </div>
            <div class="item-price">₱${parseFloat(item.product_price).toFixed(2)}</div>
            <div class="quantity">
                <button class="qty-btn decrease">-</button>
                <input type="number" value="${item.quantity}" min="1" class="qty-input">
                <button class="qty-btn increase">+</button>
            </div>
            <div class="item-actions">
                <img src="../imahe/trashIcon.png" alt="Remove" class="delete-btn">
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    attachEventListeners();
    updateOrderSummary(cartItems);
}

// ✅ Attach event listeners after rendering cart items
function attachEventListeners() {
    document.querySelectorAll(".increase").forEach(button => {
        button.addEventListener("click", function () {
            const cartId = this.closest(".cart-item").dataset.cartId;
            const inputField = this.previousElementSibling;
            updateQuantity(cartId, parseInt(inputField.value) + 1);
        });
    });

    document.querySelectorAll(".decrease").forEach(button => {
        button.addEventListener("click", function () {
            const cartId = this.closest(".cart-item").dataset.cartId;
            const inputField = this.nextElementSibling;
            if (parseInt(inputField.value) > 1) {
                updateQuantity(cartId, parseInt(inputField.value) - 1);
            }
        });
    });

    document.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", function () {
            const cartId = this.closest(".cart-item").dataset.cartId;
            if (parseInt(this.value) < 1) {
                this.value = 1;
            }
            updateQuantity(cartId, parseInt(this.value));
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
            const cartId = this.closest(".cart-item").dataset.cartId;
            removeFromCart(cartId);
        });
    });
}

// ✅ Update order summary
function updateOrderSummary(cartItems) {
    const subtotalElement = document.querySelector(".order-summary p:nth-child(2) span");
    const totalElement = document.querySelector(".order-summary p:nth-child(4) span");

    if (!subtotalElement || !totalElement) {
        console.error("Order summary elements not found.");
        return;
    }

    let totalPrice = 0;

    cartItems.forEach(item => {
        totalPrice += parseFloat(item.total_price);
    });

    subtotalElement.textContent = `₱${totalPrice.toFixed(2)}`;
    totalElement.textContent = `₱${(totalPrice + 50).toFixed(2)}`; // Shipping fee
}

// ✅ Remove a single item
async function removeFromCart(cartId) {
    const authToken = localStorage.getItem("authToken");

    if (!confirm("Are you sure you want to remove this item from your cart?")) {
        return;
    }

    try {
        await fetch(`http://localhost/jmab/final-jmab/api/carts/${cartId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        });

        alert("Product removed.");
        fetchUserCart(); // Refresh cart
    } catch (error) {
        console.error("Error removing item:", error);
        alert("An error occurred while removing the item.");
    }
}

// ✅ Remove selected items
async function removeSelectedItems() {
    const authToken = localStorage.getItem("authToken");

    const selectedItems = document.querySelectorAll(".item-checkbox:checked");
    if (selectedItems.length === 0) {
        alert("No items selected for deletion.");
        return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedItems.length} item(s) from your cart?`)) {
        return;
    }

    try {
        for (const checkbox of selectedItems) {
            const cartId = checkbox.closest(".cart-item").dataset.cartId;

            await fetch(`http://localhost/jmab/final-jmab/api/carts/${cartId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });
        }

        alert("Selected products removed.");
        fetchUserCart(); // Refresh cart
    } catch (error) {
        console.error("Error removing selected items:", error);
        alert("An error occurred while removing the items.");
    }
}

// ✅ Select All Function
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById("select-all");
    const itemCheckboxes = document.querySelectorAll(".item-checkbox");

    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Optional: Function to update cart counter if you have one in your UI
/*function updateCartCounter() {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) return;
    
    fetch(`http://localhost/jmab/final-jmab/api/carts?user_id=${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.cart) {
            // Calculate total items in cart
            const totalItems = result.cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
            
            // Update cart counter if you have one in your UI
            // Example: document.getElementById('cart-counter').textContent = totalItems;
        }
    })
    .catch(error => console.error("Error fetching cart count:", error));
}*/