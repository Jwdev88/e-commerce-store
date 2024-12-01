import { model } from "mongoose";
import orderModel from "../models/ordermodel.js";
import userModel from "../models/userModel.js";
import midtransClient from "midtrans-client";


const currency = "IDR";
const deliveryCharge = 100;


// Inisialisasi Core API dengan Server Key
let snap = new midtransClient.Snap({
  isProduction:false,
  serverKey: process.env.MIDTRANS_SERVER_KEY
})
// COD METHOD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placeced" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const placeOrderMidtrans = async (req, res) => {
  try {
    const { userId, items, amount, address} = req.body;
  
  
    let parameter = {
      transaction_details: {
        order_id: Date.now(), // Generate order ID unik
        gross_amount: amount
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: address.firstName,
        last_name: address.lastName,  
        phone: address.phone,
        email: address.email,
      }
    };

    // Generate token Midtrans Snap
    const transactionToken = await snap.createTransaction(parameter)  ;
    // Simpan data order ke database
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: 'Midtrans',
      payment: false, // Status pembayaran awal false
      transactionToken: transactionToken.token, // Simpan token Midtrans
      date: Date.now(),
 
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
 


    // Kirim token Midtrans ke frontend
    res.json({ 
      success: true, 
      message: 'Order Placed', 
      token: transactionToken.token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Stripe METHOD
const placeOrderStripe = async (req, res) => {};

// Razorpay METHOD
const placeOrderRazorpay = async (req, res) => {};

// all orders data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user order data for users
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Update" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const handleNotification = async (req, res) => {
  try {
    let notification = req.body;
    let orderId = notification.order_id;
    let transactionStatus = notification.transaction_status;
    let fraudStatus = notification.fraud_status;
    // Lakukan validasi notifikasi di sini

    // Update status order di database
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        await orderModel.findOneAndUpdate(
          { transactionToken: orderId },
          { payment: "challenge" }
        );
      } else if (fraudStatus == "accept") {
        await orderModel.findOneAndUpdate(
          { transactionToken: orderId },
          { payment: true }
        );
      }
    } else if (transactionStatus == "settlement") {
      await orderModel.findOneAndUpdate(
        { transactionToken: orderId },
        { payment: true }
      );
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      await orderModel.findOneAndUpdate(
        { transactionToken: orderId },
        { payment: false }
      );
    } else if (transactionStatus == "pending") {
      await orderModel.findOneAndUpdate(
        { transactionToken: orderId },
        { payment: "pending" }
      );
    }

    res.status(200).send("OK");
  } catch (e) {
    console.log("Error:", e);
    res.status(500).send(e);
  }
};

export {
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  placeOrderMidtrans,
  handleNotification,
};
