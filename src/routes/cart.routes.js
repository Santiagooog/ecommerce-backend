import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

/* ------------------ 1. Obtener carrito del usuario ------------------ */
router.get("/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // Obtener carrito del usuario
    const [carrito] = await db.query(
      "SELECT id_carrito FROM carrito WHERE id_usuario = ?",
      [id_usuario]
    );

    if (carrito.length === 0) return res.json([]);

    const id_carrito = carrito[0].id_carrito;

    // Obtener productos del carrito
    const [productos] = await db.query(
      `SELECT dc.id_detalle_carrito, dc.cantidad, dc.precio_unitario,
              p.nombre, p.descripcion, p.imagen_url
       FROM detalle_carrito dc
       JOIN producto p ON p.id_producto = dc.id_producto
       WHERE dc.id_carrito = ?`,
      [id_carrito]
    );

    res.json(productos);
  } catch (error) {
    console.error("❌ Error GET /cart:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ 2. Agregar producto al carrito ------------------ */
router.post("/add", async (req, res) => {
  console.log("📩 BODY RECIBIDO:", req.body);
  const { id_usuario, id_producto, cantidad } = req.body;

  try {
    // Buscar carrito del usuario
    const [carrito] = await db.query(
      "SELECT id_carrito FROM carrito WHERE id_usuario = ?",
      [id_usuario]
    );

    if (carrito.length === 0)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const id_carrito = carrito[0].id_carrito;

    // Buscar si el producto ya está en el carrito
    const [existe] = await db.query(
      "SELECT * FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?",
      [id_carrito, id_producto]
    );

    if (existe.length > 0) {
      await db.query(
        "UPDATE detalle_carrito SET cantidad = cantidad + ? WHERE id_detalle_carrito = ?",
        [cantidad, existe[0].id_detalle_carrito]
      );
      return res.json({ msg: "Cantidad actualizada" });
    }

    // Obtener precio desde tabla producto
    const [producto] = await db.query(
      "SELECT precio FROM producto WHERE id_producto = ?",
      [id_producto]
    );

    await db.query(
      "INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
      [id_carrito, id_producto, cantidad, producto[0].precio]
    );

    res.json({ msg: "Producto agregado al carrito" });
  } catch (err) {
    console.log("❌ Error en /add:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ 3. Actualizar cantidad ------------------ */
router.put("/update", async (req, res) => {
  const { id_detalle_carrito, cantidad } = req.body;

  try {
    await db.query(
      "UPDATE detalle_carrito SET cantidad = ? WHERE id_detalle_carrito = ?",
      [cantidad, id_detalle_carrito]
    );
    res.json({ msg: "Cantidad actualizada" });
  } catch (error) {
    console.error("❌ Error PUT /update:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------ 4. Eliminar producto del carrito ------------------ */
router.delete("/delete/:id_detalle_carrito", async (req, res) => {
  const { id_detalle_carrito } = req.params;

  try {
    await db.query(
      "DELETE FROM detalle_carrito WHERE id_detalle_carrito = ?",
      [id_detalle_carrito]
    );
    res.json({ msg: "Producto eliminado" });
  } catch (error) {
    console.error("❌ Error DELETE /delete:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
