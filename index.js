require("dotenv").config();
const express = require("express");
const app = express();

require("./startup/db")();
require("./startup/routes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
