// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let total = calcularTotal(carrito);

// Cargar el carrito y productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
    cargarProductos();
});

// Función para cargar productos desde el JSON local
function cargarProductos() {
    fetch('productos.json')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta de la red: ' + response.statusText);
            return response.json();
        })
        .then(mostrarProductos)
        .catch(error => console.error('Error al cargar productos:', error));
}

// Función para mostrar los productos
function mostrarProductos(productos) {
    if (!Array.isArray(productos) || productos.length === 0) {
        console.error('No se encontraron productos.');
        return;
    }

    const contenedorProductos = document.getElementById('productos');
    if (contenedorProductos) {
        contenedorProductos.innerHTML = productos.map(producto => `
            <div class="col">
                <div class="card shadow-lg h-100">
                    <img src="${producto.imagen}" class="card-img-top img-fluid" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text"><span class="badge bg-info">$${producto.precio}</span></p>
                        <button class="btn btn-success" onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        console.error('Contenedor de productos no encontrado en el DOM.');
    }
}

// Función para calcular el total del carrito
function calcularTotal(carrito) {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
}

// Función para agregar un producto al carrito
function agregarAlCarrito(id, nombre, precio) {
    if (!id || !nombre || precio <= 0) {
        console.error('Datos del producto inválidos. ID:', id, 'Nombre:', nombre, 'Precio:', precio);
        return;
    }

    const productoEnCarrito = carrito.find(item => item.id === id);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    total += precio;

    localStorage.setItem('carrito', JSON.stringify(carrito));
    Swal.fire({
        title: '¡Producto agregado!',
        text: `${nombre} se ha agregado al carrito.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    actualizarCarrito();
}

// Función para actualizar el carrito en el DOM
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById('carrito');
    if (contenedorCarrito) {
        contenedorCarrito.innerHTML = carrito.map(producto => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
                <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
            </li>
        `).join('');
    } else {
        console.error('Contenedor del carrito no encontrado en el DOM.');
    }

    document.getElementById('total').textContent = total;
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(id) {
    const producto = carrito.find(item => item.id === id);
    if (producto) {
        total -= producto.precio * producto.cantidad;
        carrito = carrito.filter(item => item.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();
    } else {
        console.error('Producto no encontrado en el carrito. ID:', id);
    }
}

// Evento para finalizar la compra
document.getElementById('finalizar-compra')?.addEventListener('click', () => {
    if (carrito.length === 0) {
        Swal.fire('El carrito está vacío', 'Agrega productos antes de finalizar la compra.', 'warning');
    } else {
        Swal.fire('¡Compra finalizada!', 'Gracias por tu compra.', 'success');
        carrito = [];
        total = 0;
        localStorage.removeItem('carrito');
        actualizarCarrito();
    }
});

// Evento para alternar la visibilidad del carrito
document.querySelector('.nav-link')?.addEventListener('click', () => {
    const carritoContenedor = document.getElementById('carrito-contenedor');
    if (carritoContenedor) {
        carritoContenedor.classList.toggle('show');
    } else {
        console.error('Contenedor del carrito no encontrado para alternar visibilidad.');
    }
});
