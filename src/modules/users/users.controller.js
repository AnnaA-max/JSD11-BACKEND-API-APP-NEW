//keep handeler function of routes or endpoints(opertions of users)

import { data } from "react-router-dom";
import { users } from "../../mock-db/users.js";
import { User } from "./users.model.js";


// ✅route handler: Get a single usesr by id from the database
export const getUser2 = async(req, res) => {
  const {id} = req.params;

  try {
    const doc = await User.findById(id).select("-password")

    if(!doc) {
      return res.status(404).json({
        success: false,
        error: "User not found..."
      })
    }

    return res.status(200).json({
      success: true,
      data: doc
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to get a use...",
    });
  }
 };

// use VERB to create names of function
// ❌route handler: get all users (mock)
export const getUsers1 = (req, res) => {
  res.status(200).json(users);
  console.log(res);
};

// ✅route handler: get all users from the database
export const getUsers2 = async(req,res) => { 
  try {
    const users = await User.find().select("-password")  //ไม่เอาpassword
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:  "Failed to get users..."
    });
  }
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

// ✅route handler: delete a new user in the database
export const deleteUser2 = async (req, res) => { 
  const { id } = req.params;

  try {
    const deleted = await User.findByIdAndDelete(id)

    //validation by if statement
    if(!deleted){
      return res.status(404).json({
        success: false,
        error: "User naot found..."
      });
    }

    return  res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete user"
    });
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

// ✅route handler: create a new user in the database
// req.body คือที่อยู่ของข้อมูลที่ client ส่งมาเพื่อ “สร้างหรือแก้ไข” ข้อมูล
export const createUser2 = async (req, res) => {
  const {username, email, password} = req.body 

    // validation data
    // ถ้าไม่มีข้อมูลเหล่านี้ จะreturn
  if(!username || !email || !password){
      return res.status(400).json({
        success: false,  // ติดต่อไม่สำเร็จ ข้อมูลuserขาดหาย
        error: "username, email, and password are required",
      });
    }

  try {
    const doc = await User.create({username, email, password});

    const safe = doc.toObject()
    delete safe.password //ห้ามส่ง password กลับไปให้ client

    return res.status(201).json({
      success: true,
      data: safe,
    })

  } catch (error) {
    if(error.code === 11000){
      return res.status(409).json({
        success: false,
        error: "Email already in use!"
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to create user..."
    });
  }

};


// ✅ route handler: update a user in the database
export const updateUser2 = async (req, res) => {
  const { id } = req.params; //ขอ id ของ user ที่จะอัปเดต

  const body = req.body;

  try {
    const updated = await User.findByIdAndUpdate(id, body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "User not found...",
      });
    }

    const safe = updated.toObject();
    delete safe.password;

    return res.status(200).json({
      success: true,
      data: safe,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Email already in use!",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to update user...",
    });
  }
};