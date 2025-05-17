import "dotenv/config";
import app from "./src/app.js";

const port = process.env.SERVER_PORT;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
