import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();



router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const [product] = await db.query(
    "SELECT * FROM producto WHERE id_producto = ?",
    [id]
  );

  if (product.length === 0)
    return res.status(404).json({ error: "Producto no encontrado" });

  res.json(product[0]);
});



// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { categoria } = req.query;

    console.log("Categoria recibida:", categoria);

    let query = "SELECT * FROM producto";
    let params = [];

    if (categoria) {
      query += " WHERE LOWER(categoria) = LOWER(?)";
      params.push(categoria);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET products:", err);
    res.status(500).json({ error: err.message });
  }
});



// Obtener un producto por ID
router.get("/:id_producto", async (req, res) => {
  const { id_producto } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM Producto WHERE id_producto = ?", [id_producto]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear producto
router.post("/", async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO Producto (nombre, descripcion, precio, stock, categoria, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, stock, categoria, imagen_url]
    );

    res.json({ msg: "Producto creado", id_producto: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar producto
router.put("/:id_producto", async (req, res) => {
  const { id_producto } = req.params;
  const updates = req.body;

  try {
    const fields = [];
    const values = [];

    for (const key of Object.keys(updates)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }

    if (fields.length === 0) return res.status(400).json({ error: "Nada para actualizar" });

    values.push(id_producto);

    const sql = `UPDATE Producto SET ${fields.join(", ")} WHERE id_producto = ?`;
    await db.query(sql, values);

    res.json({ msg: "Producto actualizado" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto
router.delete("/:id_producto", async (req, res) => {
  const { id_producto } = req.params;

  try {
    const [result] = await db.query("DELETE FROM Producto WHERE id_producto = ?", [id_producto]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ msg: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
