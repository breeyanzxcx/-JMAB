document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('createProductForm');
    const categorySelect = document.getElementById('category');
    const sizeField = document.getElementById('sizeField');
    const voltageField = document.getElementById('voltageField');
    const productFormContainer = document.getElementById('productFormContainer');
    const addProductButton = document.getElementById('addProductButton');
    const cancelButton = document.getElementById('cancelButton');
    const tireSection = document.querySelector('.tire-section');
    const batterySection = document.querySelector('.Battery-section');
    const lubricantSection = document.querySelector('.Lubricant-section');
    const oilSection = document.querySelector('.Oil-section');
  
    addProductButton.addEventListener('click', function() {
        productFormContainer.style.display = 'block';
    });

    cancelButton.addEventListener('click', function() {
        productFormContainer.style.display = 'none';
    });

    categorySelect.addEventListener('change', function() {
      
        sizeField.style.display = this.value === 'Tires' ? 'block' : 'none';
        voltageField.style.display = this.value === 'Batteries' ? 'block' : 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        productData.tags = productData.tags ? productData.tags.split(',').map(tag => tag.trim()) : [];

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please log in first.');
                return;
            }

            const response = await fetch('http://localhost/jmab/final-jmab/api/products', { /*create*/
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Product created successfully!');
                form.reset();
                loadProducts();  
            } else {
                alert('Error: ' + result.errors.join('\n'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the product.');
        }
    });

    // Logout confirmation
    document.getElementById('logout').addEventListener('click', function (e) {
        e.preventDefault();
        const isConfirmed = confirm("Are you sure you want to log out?");
        if (isConfirmed) {
            window.location.href = '../J-Mab/HTML/sign-in.php';
        }
    });

    // Fetch and display products
    async function loadProducts() {
        try {
            const response = await fetch('http://localhost/jmab/final-jmab/api/products');
            const data = await response.json();
    
            console.log('API Response:', data);
    
            if (data.success && Array.isArray(data.products)) {
                const products = data.products;
    
                tireSection.innerHTML = '';
                batterySection.innerHTML = '';
                lubricantSection.innerHTML = '';
                oilSection.innerHTML = '';
    
                products.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.classList.add('item-container');
    
                       productElement.innerHTML = `
                        <img src="${product.image_url}" alt="${product.name}" class="product-image">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <p>Stock: ${product.stock}</p>
                        ${product.size ? `<p>Size: ${product.size}</p>` : ''}
                        ${product.voltage ? `<p>Voltage: ${product.voltage}</p>` : ''}
                        <p>Price: ₱${product.price}</p>
                       
                    `;
    
                    switch (product.category) {
                        case 'Tires': tireSection.appendChild(productElement); break;
                        case 'Batteries': batterySection.appendChild(productElement); break;
                        case 'Lubricants': lubricantSection.appendChild(productElement); break;
                        case 'Oils': oilSection.appendChild(productElement); break;
                    }
                });
    
    
                document.querySelectorAll('.remove-product-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const productId = this.getAttribute('data-id');
                        deleteProduct(productId);
                    });
                });
            } else {
                console.error('Error: Unexpected API response format.', data);
                alert('Error loading products.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('An error occurred while fetching products.');
        }
    }

    /*async function deleteProduct(productId) {  <button class="remove-product-btn" data-id="${product.id}">Remove Product</button>
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }
    
        try {
            const response = await fetch('http://localhost/jmab/old_jmab/api/product/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDExNDY3MjAsImV4cCI6MTc0MTc1MTUyMCwic3ViIjo0MSwiZW1haWwiOiJhZG1pbkBlbWFpbC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdfQ.C-cjV3onR7B1EQyekmHREhllvjBEiJc3pjKf7SGsnTY'
                },
                body: JSON.stringify({ id: productId })
            });
    
            const result = await response.json();
            console.log('Delete API Response:', result);
    
            if (result.success) {
                alert('Product removed successfully!');
                loadProducts(); 
            } else {
                alert('Error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product.');
        }
    }*/

    loadProducts();
});