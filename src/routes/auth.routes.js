import { Router } from "express";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = "MI_SECRETO_SUPER_SEGURO"; // ⚠ Pásalo a .env

router.post("/register", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo,
      contrasena,
      telefono,
      direccion,
    } = req.body;

    // Encriptar
    const hashedPass = await bcrypt.hash(contrasena, 10);

    await db.query(
      `INSERT INTO usuario 
      (nombre, apellido, correo, contrasena, telefono, direccion, rol, idioma_preferido) 
      VALUES (?, ?, ?, ?, ?, ?, 'cliente', 1)`,
      [nombre, apellido, correo, hashedPass, telefono, direccion]
    );

    res.json({ msg: "Usuario registrado correctamente" });

  } catch (err) {
    console.log("❌ Error en registro:", err);
    res.status(500).json({ error: err.message });
  }
});
