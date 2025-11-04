import { db } from "../config/db.js";

// Crear pedido desde carrito
export const createOrder = async (req, res) => {
  const { id_usuario, id_carrito } = req.body;

  try {
    // Obtener items del carrito
    const [items] = await db.query(
      `SELECT dc.id_producto, dc.cantidad, p.precio, p.stock
       FROM Detalle_carrito dc
       JOIN Producto p ON dc.id_producto = p.id_producto
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
          error: `Stock insuficiente para el producto ${item.id_producto}`
        });
      }
    }

    // Calcular total
    const total = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );

    // Crear pedido
    const [pedido] = await db.query(
      `INSERT INTO Pedido (id_usuario, fecha, total, estado) 
       VALUES (?, NOW(), ?, 'pendiente')`,
      [id_usuario, total]
    );

    const id_pedido = pedido.insertId;

    // Insertar detalles
    for (const item of items) {
      await db.query(
        `INSERT INTO Detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_pedido, item.id_producto, item.cantidad, item.precio]
      );

      // Reducir stock
      await db.query(
        `UPDATE Producto SET stock = stock - ? WHERE id_producto = ?`,
        [item.cantidad, item.id_producto]
      );
    }

    // Cerrar carrito y vaciarlo
    await db.query(
      `UPDATE Carrito SET estado='cerrado' WHERE id_carrito = ?`,
      [id_carrito]
    );

    await db.query(
      `DELETE FROM Detalle_carrito WHERE id_carrito = ?`,
      [id_carrito]
    );

    res.json({ msg: "Pedido creado correctamente", id_pedido, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener pedidos de usuario
export const getUserOrders = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [orders] = await db.query(
      `SELECT * FROM Pedido WHERE id_usuario = ? ORDER BY fecha DESC`,
      [id_usuario]
    );

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener detalles de un pedido
export const getOrderDetails = async (req, res) => {
  const { id_pedido } = req.params;

  try {
    const [details] = await db.query(
      `SELECT dp.id_detalle, p.nombre, dp.cantidad, dp.precio_unitario
       FROM Detalle_pedido dp
       JOIN Producto p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [id_pedido]
    );

    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
