import express, {
  type Application,
} from "express";
import * as dotenv from "dotenv";
import sequelize from "./src/db/connection";
import { swapFairyHandler } from "./src/routeHandlers/swapFairyHandler";

dotenv.config();

// Sync the models with the database
sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized");
});

const app: Application = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 



app.post("/swap-fairy", swapFairyHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized");
});
