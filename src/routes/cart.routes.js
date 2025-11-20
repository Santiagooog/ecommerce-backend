// src/routes/cart.routes.js
import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

/**
 * Obtiene el carrito del usuario autenticado.
 * - Si no existe carrito "abierto", lo crea.
 * Devuelve { id_carrito, items: [...] }
 */
router.get("/", async (req, res) => {
  const id_usuario = req.user?.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    // Buscar carrito abierto del usuario
    let [carritoRows] = await db.query(
      "SELECT id_carrito FROM Carrito WHERE id_usuario = ?",
      [id_usuario]
    );

    let id_carrito;

    if (carritoRows.length === 0) {
      // Crear carrito si no existe
      const [nuevoCarrito] = await db.query(
        "INSERT INTO Carrito (id_usuario) VALUES (?)",
        [id_usuario]
      );
      id_carrito = nuevoCarrito.insertId;
    } else {
      id_carrito = carritoRows[0].id_carrito;
    }

    // Obtener items del carrito
    const [items] = await db.query(
      `SELECT dc.id_detalle_carrito,
              dc.cantidad,
              dc.precio_unitario,
              p.id_producto,
              p.nombre,
              p.descripcion,
              p.imagen_url
       FROM Detalle_carrito dc
       JOIN Producto p ON p.id_producto = dc.id_producto
       WHERE dc.id_carrito = ?`,
      [id_carrito]
    );

    res.json({ id_carrito, items });
  } catch (error) {
    console.error("Error GET /cart:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Agregar producto al carrito del usuario autenticado.
 * Body: { id_producto, cantidad }
 */
router.post("/add", async (req, res) => {
  const id_usuario = req.user?.id_usuario;
  const { id_producto, cantidad } = req.body;

  if (!id_usuario) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  if (!id_producto || !cantidad) {
    return res.status(400).json({ error: "Faltan id_producto o cantidad" });
  }

  try {
    // Buscar carrito abierto
    let [carritoRows] = await db.query(
      "SELECT id_carrito FROM Carrito WHERE id_usuario = ?",
      [id_usuario]
    );

    let id_carrito;

    if (carritoRows.length === 0) {
      const [nuevoCarrito] = await db.query(
        "INSERT INTO Carrito (id_usuario) VALUES (?)",
        [id_usuario]
      );
      id_carrito = nuevoCarrito.insertId;
    } else {
      id_carrito = carritoRows[0].id_carrito;
    }

    // ¿El producto ya existe en el carrito?
    const [existe] = await db.query(
      "SELECT * FROM Detalle_carrito WHERE id_carrito = ? AND id_producto = ?",
      [id_carrito, id_producto]
    );

    if (existe.length > 0) {
      await db.query(
        "UPDATE Detalle_carrito SET cantidad = cantidad + ? WHERE id_detalle_carrito = ?",
        [cantidad, existe[0].id_detalle_carrito]
      );
      return res.json({ msg: "Cantidad actualizada", id_carrito });
    }

    // Obtener precio del producto
    const [producto] = await db.query(
      "SELECT precio FROM Producto WHERE id_producto = ?",
      [id_producto]
    );

    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await db.query(
      "INSERT INTO Detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
      [id_carrito, id_producto, cantidad, producto[0].precio]
    );

    res.json({ msg: "Producto agregado al carrito", id_carrito });
  } catch (err) {
    console.error("Error POST /cart/add:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Actualizar cantidad de un ítem del carrito
 */
router.put("/update", async (req, res) => {
  const { id_detalle_carrito, cantidad } = req.body;

  try {
    await db.query(
      "UPDATE Detalle_carrito SET cantidad = ? WHERE id_detalle_carrito = ?",
      [cantidad, id_detalle_carrito]
    );
    res.json({ msg: "Cantidad actualizada" });
  } catch (error) {
    console.error("Error PUT /cart/update:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Eliminar producto del carrito
 */
router.delete("/delete/:id_detalle_carrito", async (req, res) => {
  const { id_detalle_carrito } = req.params;

  try {
    await db.query(
      "DELETE FROM Detalle_carrito WHERE id_detalle_carrito = ?",
      [id_detalle_carrito]
    );
    res.json({ msg: "Producto eliminado" });
  } catch (error) {
    console.error("Error DELETE /cart/delete:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
