const express = require("express")
const db = require("../../db")

const router = express.Router()

router.post("/", async (req, res)=>{
    const response = await db.query("INSERT INTO shoppingcarts (productid, userid) VALUES ($1, $2) RETURNING _id",
                                [ req.body.productid, req.body.userid])

    res.send(response.rows[0])
})

router.get("/:userId", async (req, res) => {
    const response = await db.query(`SELECT products._id, products.name, products.brand, products.category, products.price as unitary_price, COUNT(*) As quantity, COUNT(*) * price as total
                                     FROM shoppingcarts JOIN "products" ON shoppingcarts.productid = "products"._id
                                     WHERE userid = $1
                                     GROUP BY products._id, products.name, products.brand, products.category, products.price
                                     `, [ req.params.userId])

    res.send(response.rows)
})

router.delete("/:userId/:id", async (req, res) =>{
    // SELECTING ONE of the shoppingcart items to be deleted
    //(SELECT id FROM shoppingcart 
    //    WHERE bookid = $1 AND userid = $2
    //    LIMIT 1)

    // DELETE where the record ID is the one in the result from the subquery
    // DELETE FROM shoppingcart where id IN 

    const response = await db.query(`DELETE FROM shoppingcarts where _id IN
                                     (SELECT _id FROM shoppingcarts 
                                      WHERE productid = $1 AND userid = $2
                                      LIMIT 1)`,
                                      [ req.params.id, req.params.userId])
    
    if (response.rowCount === 0)
        return res.status(404).send("Not found")
    
    res.send("DELETED")
})


module.exports = router;