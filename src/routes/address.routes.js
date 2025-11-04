import { Router } from "express";
import { 
  addAddress, 
  getUserAddresses, 
  removeAddress, 
  makeDefaultAddress 
} from "../controllers/address.controller.js";

const router = Router();

// Crear dirección
router.post("/", addAddress);

// Obtener direcciones de un usuario
router.get("/:id_usuario", getUserAddresses);

// Eliminar dirección
router.delete("/:id_direccion/:id_usuario", removeAddress);

// Marcar como dirección predeterminada
router.put("/default/:id_direccion/:id_usuario", makeDefaultAddress);

export default router;
