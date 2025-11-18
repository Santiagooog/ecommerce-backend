import express from 'express'
import cors from 'cors'
import orderRoutes from './src/routes/order.routes.js'
import addressRoutes from './src/routes/address.routes.js'
import productRoutes from './src/routes/product.routes.js'
import cartRoutes from "./src/routes/cart.routes.js"

const app = express()

app.use(cors())
app.use(express.json())
// Todas las rutas normales
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.use((req, res) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
});



app.listen(4000,()=> console.log('Servidor en puerto 4000'))