import express from 'express'
import cors from 'cors'
import cartRoutes from './src/routes/cart.routes.js'
import orderRoutes from './src/routes/order.routes.js'
import addressRoutes from './src/routes/address.routes.js'
import productRoutes from './src/routes/product.routes.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/products", productRoutes)

app.length('/', (req,res) =>{
  res.json({msg: 'API ECOMMERCE FUNCIONANDO'})
})

app.listen(4000,()=> console.log('Servidor en puerto 4000'))