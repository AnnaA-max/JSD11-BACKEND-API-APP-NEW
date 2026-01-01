//keep handeler function of routes or endpoints(opertions of users)

import { users } from "../../mock-db/user.js";

// use VERB to create names of function
export const getUsers = (req, res) => {
  res.status(200).json(users);
  console.log(res);
};
