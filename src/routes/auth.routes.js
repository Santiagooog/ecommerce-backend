import { Router } from "express";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";     // <<--- IMPORT CORRECTO
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = "SUPER_SECRETO_123"; // ponlo en .env

// ==========================
// LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const [user] = await db.query(
      "SELECT * FROM usuario WHERE correo = ?",
      [correo]
    );

    if (user.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const usuario = user[0];

    // Comparar contraseñas
    const valido = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!valido)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    // Generar token
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        rol: usuario.rol
      },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (err) {
    console.log("❌ Error en /login:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// REGISTRO
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, telefono, direccion } = req.body;

    // Hashear contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    await db.query(
      "INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, direccion, rol, idioma_preferido) VALUES (?, ?, ?, ?, ?, ?, 'cliente', 1)",
      [nombre, apellido, correo, hash, telefono, direccion]
    );

    res.json({ msg: "Usuario registrado correctamente" });

  } catch (err) {
    console.log("❌ Error en /register:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
