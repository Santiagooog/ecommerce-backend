import { db } from "../config/db.js";

// Crear carrito si no existe
export const createCart = async (req, res) => {
  const { id_usuario } = req.body;

  try {
    const [carrito] = await db.query(
      `SELECT * FROM Carrito WHERE id_usuario = ? AND estado = 'abierto'`,
      [id_usuario]
    );

    if (carrito.length > 0) {
      return res.json({ msg: "Carrito activo encontrado", id_carrito: carrito[0].id_carrito });
    }

    const [newCart] = await db.query(
      `INSERT INTO Carrito (id_usuario, estado) VALUES (?, 'abierto')`,
      [id_usuario]
    );

    res.json({ msg: "Carrito creado", id_carrito: newCart.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Agregar item al carrito
export const addToCart = async (req, res) => {
  const { id_carrito, id_producto, cantidad } = req.body;

  try {
    const [item] = await db.query(
      `SELECT * FROM Detalle_carrito WHERE id_carrito = ? AND id_producto = ?`,
      [id_carrito, id_producto]
    );

    if (item.length > 0) {
      await db.query(
        `UPDATE Detalle_carrito SET cantidad = cantidad + ? WHERE id_carrito = ? AND id_producto = ?`,
        [cantidad, id_carrito, id_producto]
      );
      return res.json({ msg: "Cantidad actualizada" });
    }

    await db.query(
      `INSERT INTO Detalle_carrito (id_carrito, id_producto, cantidad)
       VALUES (?, ?, ?)`,
      [id_carrito, id_producto, cantidad]
    );

    res.json({ msg: "Producto agregado al carrito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener carrito
export const getCart = async (req, res) => {
  const { id_carrito } = req.params;

  try {
    const [items] = await db.query(
      `SELECT dc.*, p.nombre, p.precio, p.imagen_url
       FROM Detalle_carrito dc
       JOIN Producto p ON dc.id_producto = p.id_producto
       WHERE dc.id_carrito = ?`,
      [id_carrito]
    );

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar producto del carrito
export const removeFromCart = async (req, res) => {
  const { id_carrito, id_producto } = req.body;

  try {
    await db.query(
      `DELETE FROM Detalle_carrito WHERE id_carrito = ? AND id_producto = ?`,
      [id_carrito, id_producto]
    );

    res.json({ msg: "Producto eliminado del carrito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
