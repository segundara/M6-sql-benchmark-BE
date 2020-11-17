const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const db = require("./db")
const productRouter = require("./routes/products")
const reviewRouter = require("./routes/reviews")
const cartRouter = require("./routes/cart")
const listEndpoints = require("express-list-endpoints")
const { join } = require("path")

const server = express()
// server.use(cors())

// const whitelist = ["https://strive-mazon-fe.herokuapp.com"];
// const whitelist = ["http://localhost:3001"]
// const whitelist = ["https://segundara.github.io/M6-sql-Benchmark-FE/"]
const whitelist = ["https://segundara.github.io"]
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cors(corsOptions));

// const staticFolderPath = join(__dirname, "../public")
// server.use(express.static(staticFolderPath))
server.use(express.json())

// server.get("/", (req, res)=> {
//     res.send("The server is running!")
// })
// server.use(express.static(path.join(__dirname, 'build')));
// server.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

server.use("/products", productRouter)
server.use("/reviews", reviewRouter)
server.use("/cart", cartRouter)

console.log(listEndpoints(server))
server.listen(process.env.PORT || 3456, () => console.log("Running on ", process.env.PORT || 3456))