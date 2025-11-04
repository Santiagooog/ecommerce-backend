import { Router } from "express";
import {
  createCart,
  addToCart,
  getCart,
  removeFromCart
} from "../controllers/cartController.js";

const router = Router();

router.post("/create", createCart);
router.post("/add", addToCart);
router.get("/:id_carrito", getCart);
router.delete("/remove", removeFromCart);

export default router;
