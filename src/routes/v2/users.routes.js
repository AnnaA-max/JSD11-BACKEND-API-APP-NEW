import { Router } from "express";
import {
  createUser2,
  deleteUser2,
  getUser2,
  getUsers2,
  updateUser2,
} from "../../modules/users/users.controller.js";
import { User } from "../../modules/users/users.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { authUser } from "../../middlewares/auth.js";

export const router = Router();


router.get("/", getUsers2);

router.get("/:id", getUser2);

router.post("/",authUser, createUser2);  //กลับมาเพิ่มauthUser

router.delete("/:id",authUser, deleteUser2);

router.patch("/:id",authUser, updateUser2);

//  created endpoint
//  Login a user -jwt signed token (token in cookies)
//  users send data(email, password used post method to check)
router.post("/auth/cookie/login", async (req, res) => { 
  const {email, password} = req.body;

  // validation
  if(!email || !password) {
    return res.status(400).json({
      error: true ,
      message: "Email and Password are required..."
    });
  }

  try {

    // normalize (validation)
    const normalizedEmail = String(email).trim().toLowerCase();

    // email check = email in DB ,,,used mongoose to connect DB=>usersModel
    const user = await User.findOne({email: normalizedEmail}).select(
      "+password"
    );

    // ถ้าเข้าไปแล้วไม่เจอuserที่match
    if(!user) {
      return res.status(401).json({
        error: true,
        message: "User not found..."
      });
    }

    // check password
    const isMatched = await bcrypt.compare(password, user.password);

    if(!isMatched) {
      return res.status(401).json({
        error: true,
        message: "Invalid password..."
      });
    }

    // Genarate JSON Web token: password match
    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {
      // กำหนดอายุtoken
      expiresIn: "1h",
    });

    const isProd = process.env.NODE_ENV === "production"

    // setting การใช้งานcookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });


  } catch (error) {
    next(error);
  }

 });

 // Logout a user
 router.post("/auth/cookie/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  //clear cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    error: false,
    message: "Logged out successfully",
  });
});


// Check user authentication   (check if user has valid token)
// authUser for protect user login success
router.get("/auth/cookie/me", authUser, async (req, res, next) => {
  try {
    const userId = req.user.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Unauthenticated",
      });
    }

    res.status(200).json({
      error: false,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

