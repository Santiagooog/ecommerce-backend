import { Router } from "express";
import { db } from "../config/db.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

// ============================
// CREAR PEDIDO
// ============================
router.post("/create", verificarToken, async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    // Obtener carrito abierto
    const [carrito] = await db.query(
      "SELECT id_carrito FROM carrito WHERE id_usuario = ?",
      [id_usuario]
    );

    if (carrito.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const id_carrito = carrito[0].id_carrito;

    // Obtener productos del carrito
    const [items] = await db.query(
      `SELECT dc.id_producto, dc.cantidad, dc.precio_unitario, p.stock
       FROM detalle_carrito dc
       JOIN producto p ON p.id_producto = dc.id_producto
       WHERE dc.id_carrito = ?`,
      [id_carrito]
    );

    if (items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Validar stock
    for (const item of items) {
      if (item.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto ${item.id_producto}`,
        });
      }
    }

    // Total del pedido
    const total = items.reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0
    );

    // Crear pedido
    const [pedido] = await db.query(
      "INSERT INTO pedido (id_usuario, fecha, total, estado) VALUES (?, NOW(), ?, 'pendiente')",
      [id_usuario, total]
    );

    const id_pedido = pedido.insertId;

    // Insertar los detalles del pedido
    for (const item of items) {
      await db.query(
        `INSERT INTO detalle_pedido(id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_pedido, item.id_producto, item.cantidad, item.precio_unitario]
      );

      // Descontar stock
      await db.query(
        "UPDATE producto SET stock = stock - ? WHERE id_producto = ?",
        [item.cantidad, item.id_producto]
      );
    }

    // Vaciar carrito
    await db.query("DELETE FROM detalle_carrito WHERE id_carrito = ?", [id_carrito]);

    res.json({
      msg: "Pedido creado correctamente",
      id_pedido,
      total,
    });

  } catch (err) {
    console.log("❌ Error al crear pedido:", err);
    res.status(500).json({ error: "Error al procesar la compra" });
  }
});

// ============================
// OBTENER PEDIDOS DEL USUARIO
// ============================
router.get("/user", verificarToken, async (req, res) => {
  const id_usuario = req.user.id_usuario;

  const [pedidos] = await db.query(
    "SELECT * FROM pedido WHERE id_usuario = ? ORDER BY fecha DESC",
    [id_usuario]
  );

  res.json(pedidos);
});

// ============================
// DETALLE DE PEDIDO
// ============================
router.get("/details/:id_pedido", verificarToken, async (req, res) => {
  const { id_pedido } = req.params;

  const [detalles] = await db.query(
    `SELECT dp.*, p.nombre, p.imagen_url
     FROM detalle_pedido dp
     JOIN producto p ON p.id_producto = dp.id_producto
     WHERE dp.id_pedido = ?`,
    [id_pedido]
  );

  res.json(detalles);
});

export default router;
