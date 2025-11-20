import express from 'express';
import cors from 'cors';
import orderRoutes from './src/routes/order.routes.js';
import addressRoutes from './src/routes/address.routes.js';
import productRoutes from './src/routes/product.routes.js';
import cartRoutes from "./src/routes/cart.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import { verificarToken } from "./src/middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas públicas
console.log("📦 Cargando rutas de carrito...");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Rutas protegidas (requieren token)
app.use("/api/orders", verificarToken, orderRoutes);
app.use("/api/addresses", verificarToken, addressRoutes);
console.log("Intentando cargar rutas de carrito...");
console.log("cartRoutes:", cartRoutes);

app.use("/api/cart", verificarToken, cartRoutes);

app.use('/', (req, res) => {
  res.json({ msg: 'API ECOMMERCE FUNCIONANDO' });
});

app.listen(4000, () => console.log('Servidor en puerto 4000'));
