import * as parser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as routes from "./routes/index";

const app: express.Application = express();
const { PORT = 3000 } = process.env;

app.use(cors({ credentials: true, origin: true }));
app.use(helmet());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.post("/api/login", routes.setCredential, routes.userAuthentication);
app.post("/api/balance", routes.setCredential, routes.getBalance);
app.post("/api/campaigns", routes.setCredential, routes.getCampaigns);
app.post("/api/donation", routes.setCredential, routes.makeDonation);

app.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}...`),
);
