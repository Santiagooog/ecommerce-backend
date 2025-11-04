import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderDetails
} from "../controllers/orderController.js";

const router = Router();

router.post("/create", createOrder);
router.get("/user/:id_usuario", getUserOrders);
router.get("/details/:id_pedido", getOrderDetails);

export default router;
