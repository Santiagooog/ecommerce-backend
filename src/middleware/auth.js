import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "Acceso denegado: falta token" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token)
    return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SUPER_SECRETO_123");

    req.user = decoded;
    console.log("🛡️ Middleware verificarToken ejecutado");

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado, inicia sesión nuevamente" });
    }
    return res.status(403).json({ error: "Token inválido" });
  }
};
