//Definiciones de variables
const imageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const productContainer = document.getElementById('product-container');
let cart = []; 
let selectedProductIndex = null;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let imageBase64 = '';
let sales = JSON.parse(localStorage.getItem('sales')) || [];
//navegacion entre secciones
document.getElementById('btn-inventory').addEventListener('click', () => toggleSection('inventory-section'));
document.getElementById('btn-sales').addEventListener('click', () => toggleSection('sales-section'));

function toggleSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => section.classList.add('d-none'));
    document.getElementById(sectionId).classList.remove('d-none');
}
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
});
// Guardar en localStorage
function saveToLocalStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('sales', JSON.stringify(sales));
}

//Inventario

// Mostrar u ocultar el formulario de inventario
document.getElementById('toggle-inventory-form').addEventListener('click', () => {
    const formContainer = document.getElementById('inventory-form-container');
    formContainer.classList.toggle('show');
});
// vista previa de la imagen
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            imageBase64 = event.target.result; // Base64
            imagePreview.src = imageBase64;
            imagePreview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }
});

// Manejar el envío del formulario
document.getElementById('inventory-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const purchasePrice = parseFloat(document.getElementById('product-purchase-price').value);
    const salePrice = parseFloat(document.getElementById('product-sale-price').value);
    const image = imageBase64;

    if (!name || !description || quantity < 0 || purchasePrice <= 0 || salePrice <= 0 || !image) {
        alert('Por favor completa todos los campos correctamente.');
        return;
    }

    // Crear el producto con los nuevos precios
    inventory.push({ 
        name, 
        description, 
        quantity, 
        purchasePrice, 
        salePrice, 
        image 
    });

    saveToLocalStorage();
    renderProducts();

    e.target.reset();
    imageBase64 = ''; // Resetear imagen
    imagePreview.src = '#'; // Limpiar vista previa
    imagePreview.classList.add('d-none'); // Ocultar vista previa
});

// Renderizar las tarjetas de productos
function renderProducts(products = inventory) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';

    if (products.length === 0) {
        productContainer.innerHTML = '<p class="text-center">No se encontraron productos.</p>';
        return;
    }

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h5>${product.name}</h5>
            <p>${product.description.substring(0, 50)}...</p>
            <p><strong>Stock:</strong> ${product.quantity}</p>
            <div class="product-actions">
                <button class="btn btn-details" onclick="viewProductDetails(${index}, '${product.name}')">
                    Ver Detalles
                </button>
            </div>
        `;
        productContainer.appendChild(productCard);
    });
}

// Mostrar los detalles del producto en el modal
function viewProductDetails(index) {
    selectedProductIndex = index; // Guardar el índice del producto seleccionado
    const product = inventory[index];

    if (product) {
        document.getElementById('product-details-name').textContent = product.name;
        document.getElementById('product-details-description').textContent = product.description;
        document.getElementById('product-details-stock').textContent = product.quantity;
        document.getElementById('product-details-purchase-price').textContent = product.purchasePrice.toFixed(2);
        document.getElementById('product-details-sale-price').textContent = product.salePrice.toFixed(2);
        document.getElementById('product-details-image').src = product.image;

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
        modal.show();
    }
}

// Eliminar un producto
document.getElementById('delete-product-btn').addEventListener('click', () => {
    if (selectedProductIndex !== null && confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        inventory.splice(selectedProductIndex, 1); // Eliminar del inventario
        saveToLocalStorage(); // Guardar cambios
        renderProducts(); // Actualizar la vista
        selectedProductIndex = null; // Restablecer el índice seleccionado

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productDetailsModal'));
        modal.hide();
    }
});


// Reabastecer un producto
document.getElementById('restock-product-btn').addEventListener('click', () => {
    if (selectedProductIndex !== null) {
        const amount = prompt('¿Cuántas unidades deseas añadir al stock?');
        const quantity = parseInt(amount);
        if (!isNaN(quantity) && quantity > 0) {
            inventory[selectedProductIndex].quantity += quantity; // Incrementar el stock
            saveToLocalStorage(); // Guardar cambios
            renderProducts(); // Actualizar la vista

            // Actualizar el modal con el nuevo stock
            document.getElementById('product-details-stock').textContent = inventory[selectedProductIndex].quantity;
        } else {
            alert('Por favor ingresa una cantidad válida.');
        }
    }
});

// Actualizar la tabla de inventario
function updateInventoryTable() {
    const table = document.getElementById('inventory-table');
    table.innerHTML = '';
    inventory.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.quantity}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button class="delete" onclick="deleteProduct(${index})">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
                <button class="restock" onclick="restockProduct(${index})">
                    <i class="fas fa-plus"></i> Reabastecer
                </button>
            </td>
        `;
        table.appendChild(row);
    });
    populateProductDropdown();
}

// Filtro para inventario
document.getElementById('inventory-search').addEventListener('input', function () {
    const query = this.value.toLowerCase();

    // Filtrar productos que coincidan con el nombre o descripción
    const filteredInventory = inventory.filter(product =>
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
    );

    // Renderizar productos filtrados
    renderProducts(filteredInventory);
});

function renderFilteredProducts(filteredInventory) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';

    filteredInventory.forEach((product, index) => {
        const productCard = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h5>${product.name}</h5>
                <p>${product.description}</p>
                <p><strong>Cantidad:</strong> ${product.quantity}</p>
                <p><strong>Precio:</strong> $${product.salePrice.toFixed(2)}</p>
                <button onclick="App.deleteProduct(${index})" class="btn btn-danger btn-sm">Eliminar</button>
            </div>`;
        productContainer.innerHTML += productCard;
    });
}

// Ventas

// Mostrar u ocultar el formulario de ventas
document.getElementById('toggle-sales-form').addEventListener('click', () => {
    const formContainer = document.getElementById('sales-form-container');
    formContainer.classList.toggle('show');
});

// actualizar tabla de ventas
function updateSalesTable() {
    const table = document.getElementById('sales-table');
    table.innerHTML = '';
    sales.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>${sale.total.toFixed(2)}</td>
            <td>
                <button class="delete" onclick="deleteSale(${index})"><i class="fas fa-trash-alt"></i> Eliminar</button>
            </td>
        `;
        table.appendChild(row);
    });
}


// Obtener la fecha actual
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.getElementById('btn-sales').addEventListener('click', () => {
    document.getElementById('sale-date').value = getCurrentDate();

});

// Rellenar el menú desplegable con productos
function populateProductDropdown() {
    const saleProduct = document.getElementById('sale-product');
    saleProduct.innerHTML = '<option value="">Seleccionar producto</option>'; // Reiniciar opciones

    inventory.forEach((product, index) => {
        saleProduct.innerHTML += `<option value="${index}">${product.name}</option>`;
    });
}

// Manejar el registro de ventas
document.getElementById('sales-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const buyerName = document.getElementById('buyer-name').value;

    if (!buyerName) {
        alert('Por favor, ingresa el nombre del cliente.');
        return;
    }

    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const totalAmount = cart.reduce((total, item) => total + item.total, 0);
    sales.push({
        buyerName,
        date: new Date().toISOString().split('T')[0],
        products: cart,
        total: totalAmount
    });

    cart = [];
    renderCart();
    renderSales();
    saveToLocalStorage();
    alert('Venta registrada con éxito.');
    e.target.reset();
});

//renderizar ventas
function renderSales() {
    const salesTableBody = document.querySelector('#sales-table tbody');
    salesTableBody.innerHTML = '';

    if (sales.length === 0) {
        salesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas registradas.</td></tr>';
        return;
    }

    sales.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.buyerName}</td>
            <td>
                <ul>
                    ${sale.products
                        .map(
                            product => `<li>${product.productName} - ${product.quantity} x $${product.unitPrice.toFixed(2)}</li>`
                        )
                        .join('')}
                </ul>
            </td>
            <td>$${sale.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteSale(${index})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        salesTableBody.appendChild(row);
    });
}


// Eliminar una venta
function deleteSale(index) {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
        sales.splice(index, 1); // Eliminar la venta del arreglo
        saveToLocalStorage(); // Guardar cambios en localStorage
        renderSales(); // Actualizar la tabla de ventas
        alert('Venta eliminada con éxito.');
    }
}

//renderizar productos a vender
function renderModalProducts() {
    const modalProductContainer = document.getElementById('modal-product-container');
    modalProductContainer.innerHTML = '';

    if (inventory.length === 0) {
        modalProductContainer.innerHTML = '<p class="text-center">No hay productos disponibles.</p>';
        return;
    }

    inventory.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4';

        productCard.innerHTML = `
            <div class="product-card" onclick="selectProduct(${index})">
                <img src="${product.image}" alt="${product.name}">
                <h5>${product.name}</h5>
                <p>${product.description}</p>
                <p><strong>Cantidad:</strong> ${product.quantity}</p>
                <p><strong>Precio de venta:</strong> $${product.salePrice.toFixed(2)}</p>
            </div>
        `;
        modalProductContainer.appendChild(productCard);
    });
}

// Función para seleccionar un producto desde el modal
function selectProduct(index) {
    const product = inventory[index];
    document.getElementById('sale-product-name').value = product.name;
    selectedProductIndex = index;

    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();
}
document.getElementById('add-to-cart').addEventListener('click', () => {
    if (selectedProductIndex === null) {
        alert('Selecciona un producto primero.');
        return;
    }

    const quantity = parseInt(document.getElementById('sale-quantity').value);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Ingresa una cantidad válida.');
        return;
    }

    const product = inventory[selectedProductIndex];
    if (product.quantity < quantity) {
        alert('No hay suficiente stock para este producto.');
        return;
    }

    const existingProductIndex = cart.findIndex(item => item.productName === product.name);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        cart.push({
            productName: product.name,
            quantity,
            unitPrice: product.salePrice,
            total: quantity * product.salePrice
        });
    }

    product.quantity -= quantity; // Disminuir stock del inventario
    renderCart();
    saveToLocalStorage();
});

//Carrito de compras UwU

// Renderizar el carrito de compras
function renderCart() {
    const cartTableBody = document.querySelector('#cart-table tbody');
    cartTableBody.innerHTML = '';

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${item.total.toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button></td>
        `;
        cartTableBody.appendChild(row);
    });
}

// Eliminar producto del carrito
function removeFromCart(index) {
    const product = cart[index];
    const inventoryProduct = inventory.find(p => p.name === product.productName);
    inventoryProduct.quantity += product.quantity;
    cart.splice(index, 1);
    renderCart();
    saveToLocalStorage();
}

// Filtro para ventas
document.getElementById('sales-search').addEventListener('input', function () {
    const query = this.value.toLowerCase();

    // Filtrar ventas por nombre del cliente o producto vendido
    const filteredSales = sales.filter(sale =>
        sale.buyerName.toLowerCase().includes(query) || 
        sale.products.some(product => product.productName.toLowerCase().includes(query))
    );

    renderFilteredSales(filteredSales);
});
function renderFilteredSales(filteredSales) {
    const salesTableBody = document.querySelector('#sales-table tbody');
    salesTableBody.innerHTML = '';

    if (filteredSales.length === 0) {
        salesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron ventas.</td></tr>';
        return;
    }

    filteredSales.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.buyerName}</td>
            <td>
                <ul>
                    ${sale.products
                        .map(
                            product => `<li>${product.productName} - ${product.quantity} x $${product.unitPrice.toFixed(2)}</li>`
                        )
                        .join('')}
                </ul>
            </td>
            <td>$${sale.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteSale(${index})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        salesTableBody.appendChild(row);
    });
}

//Renderizado

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();  // Asegura que se rendericen los productos cuando la página se cargue
    renderModalProducts(); 
    renderSales();         
    renderCart();
    updateInventoryTable();
    updateSalesTable();
    populateProductDropdown();
});
