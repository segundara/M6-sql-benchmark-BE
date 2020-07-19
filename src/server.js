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
server.use(cors())

const staticFolderPath = join(__dirname, "../public")
server.use(express.static(staticFolderPath))
server.use(express.json())

// server.get("/", (req, res)=> {
//     res.send("The server is running!")
// })

server.use("/products", productRouter)
server.use("/reviews", reviewRouter)
server.use("/cart", cartRouter)

console.log(listEndpoints(server))
server.listen(process.env.PORT || 3456, () => console.log("Running on ", process.env.PORT || 3456))