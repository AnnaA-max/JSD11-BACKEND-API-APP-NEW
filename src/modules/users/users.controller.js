//keep handeler function of routes or endpoints(opertions of users)

import { users } from "../../mock-db/users.js";
import { User } from "./users.model.js";

// 🟡API v1
// use VERB to create names of function
// ❌route handler: get all users (mock)
export const getUsers1 = (req, res) => {
  res.status(200).json(users);
  console.log(res);
};

//delete user 1by1
// ❌route handler: delete a new usesr (mock)
export const deleteUser1 = (req, res) => {
  const userId = req.params.id;

  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    users.splice(userIndex, 1);

    res.status(200).send(`User with ID ${userId} deleted ✅`);
  } else {
    res.status(404).send("User not found.");
  }
};

// ❌route handler: create a new usesr (mock)
export const createUser1 = (req, res) => {
  const { name, email } = req.body;

  const newUser = {
    id: String(users.length + 1),
    name: name,
    email: email,
  };

  users.push(newUser);

  res.status(201).json(newUser);
};


// 🟢API v2
// ✅route handler: Get a single usesr by id from the database
export const getUser2 = async(req, res, next) => {
  const {id} = req.params;

  try {
    const doc = await User.findById(id).select("-password")

    if(!doc) {
      const error = new Error("User not found");
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: doc
    });

  } catch (error) {

    error.status = 500;
    error.name = error.name || "DatabaseError";
    error.Error = error.message || "Failed to get a user";
    return next(error);
  }
 };

// ✅route handler: get all users from the database
export const getUsers2 = async(req, res, next) => { 
  try {
    const users = await User.find().select("-password")  //ไม่เอาpassword
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    // error.name = error.name || "DatabaseError";
    // error.status = 500;
    return next(error); // ส่งต่อไปที่middlewareอีกตัว อาจจจะ404 แล้วค่อยไปที่ตัวสุดท้าย
  }
};


// ✅route handler: delete a new user in the database
export const deleteUser2 = async (req, res, next) => { 
  const { id } = req.params;

  try {
    const deleted = await User.findByIdAndDelete(id)

    //validation by if statement
    if(!deleted){
      const error = new Error("User not found");
      return next(error);
    }

    return  res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    return next(error);
  }
};

// ✅route handler: create a new user in the database
// req.body คือที่อยู่ของข้อมูลที่ client ส่งมาเพื่อ “สร้างหรือแก้ไข” ข้อมูล
export const createUser2 = async (req, res, next) => {
  const {username, email, password, role} = req.body 

    // validation data
    // ถ้าไม่มีข้อมูลเหล่านี้ จะreturn
  if(!username || !email || !password){

      const error = new Error("username, email, and password are required");
      error.name = "ValidationError";
      error.status = 400;
      return next(error)
    }

  try {
    const doc = await User.create({username, email, password, role});

    const safe = doc.toObject()
    delete safe.password //ห้ามส่ง password กลับไปให้ client

    return res.status(201).json({
      success: true,
      data: safe,
    })

  } catch (error) {

    if(error.code === 11000){
      error.status = 409;
      error.name = "DuplicateKeyError";
      error.message = "Email already in use";
    }

    error.status = 500;
    error.name = error.name || "DatabaseError";
    error.message = error.message || "Failed to create a user" ;
    return next(error)
  }
};


// ✅ route handler: update a user in the database
export const updateUser2 = async (req, res, next) => {
  const { id } = req.params; //ขอ id ของ user ที่จะอัปเดต

  const body = req.body;

  try {
    const updated = await User.findByIdAndUpdate(id, body);

    if (!updated) {

      const error = new Error("User not found...")
      return next(error);
    }

    const safe = updated.toObject();
    delete safe.password;

    return res.status(200).json({
      success: true,
      data: safe,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(error);
    }

    return next(error);
  }
};