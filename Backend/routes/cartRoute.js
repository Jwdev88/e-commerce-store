import express  from "express";
import { getUserCart,addToCart,updateCart } from "../controllers/CartController.js";
import authUser from "../middleware/Auth.js";

const cartRouter = express.Router();

// Route untuk mendapatkan cart
cartRouter.post('/get',authUser, getUserCart);
cartRouter.post('/add',authUser, addToCart);
cartRouter.post('/update',authUser, updateCart);


export default cartRouter;