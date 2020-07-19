const express = require("express")
const db = require("../../db")

const router = express.Router()

const fs = require("fs-extra")
const path = require("path")
const multer = require("multer")
const { O_NOFOLLOW } = require("constants")

const upload = multer()
const port = process.env.PORT

const imagePath = path.join(__dirname, "../../../public/image/products")

router.get("/", async(req, res)=>{
    
    const offset = req.query.offset || 0
    const limit = req.query.limit
    const sort = req.query.sort
    const order = req.query.order

    delete req.query.offset
    delete req.query.limit
    delete req.query.sort
    delete req.query.order

    let query = 'SELECT * FROM "products" ' //create query

    const params = []
    for (queryParam in req.query) { //for each value in query string, I'll filter
        params.push(req.query[queryParam])

        if (params.length === 1) 
            query += `WHERE ${queryParam} = $${params.length} `
        else 
            query += ` AND ${queryParam} = $${params.length} `
    }

    if(sort !== undefined)
        query += `ORDER BY ${sort} ${order}`  //adding the sorting 

    params.push (limit)
    query += ` LIMIT $${params.length} `
    params.push(offset)
    query += ` OFFSET $${params.length}`
    console.log(query)

    const response = await db.query(query, params)

    res.send({count: response.rows.length, data: response.rows})
})

router.get("/search/:query", async(req, res) => {
    const response = await db.query(`SELECT * FROM "products" WHERE 
                                    brand ILIKE '${"%" + req.params.query + "%"}' OR
                                    category ILIKE '${"%" + req.params.query + "%"}'
                                    LIMIT $1 OFFSET $2 
                                    `, [ req.query.limit , req.query.offset || 0])

    res.send(response.rows)
})
router.get("/:id", async (req, res)=>{
    const response = await db.query('SELECT * FROM "products" WHERE _id= $1', 
                                                                                        [ req.params.id ])

    if (response.rowCount === 0) 
        return res.status(404).send("Not found")

    res.send({data: response.rows[0]})
})

router.get("/:id/reviews", async (req, res)=>{
    const response = await db.query(`SELECT reviews._id, reviews.comment, reviews.rate,
                                    reviews.productid, products.name, products.image_url FROM "reviews" 
                                    JOIN "products" ON reviews.productid = products._id 
                                    AND products._id = $1`, 
                                    [req.params.id])
    if (response.rowCount === 0) 
        return res.status(404).send("Not found")

    res.send({data: response.rows})
})

router.post("/", async (req, res)=> {
    const response = await db.query(`INSERT INTO "products" ( name, brand, description, image_url, category, price) 
                                     Values ($1, $2, $3, $4, $5, $6)
                                     RETURNING *`, 
                                    [ req.body.name, req.body.brand, req.body.description, req.body.image_url, req.body.category, req.body.price ])
    
    console.log(response)
    res.send(response.rows[0])
})

router.put("/:id", async (req, res)=> {
    body = {
        ...req.body,
        //"updated_at": Date.now()
      }

    try {
        let params = []
        let query = 'UPDATE "products" SET '
        for (bodyParamName in body) {
            query += // for each element in the body I'll add something like parameterName = $Position
                (params.length > 0 ? ", " : '') + //I'll add a coma before the parameterName for every parameter but the first
                bodyParamName + " = $" + (params.length + 1) // += Category = $1 

            params.push(body[bodyParamName]) //save the current body parameter into the params array
            //params.push(req.body{"updated_at": NOW()})
        }

        params.push(req.params.id) //push the id into the array
        query += " WHERE _id = $" + (params.length) + " RETURNING *" 
        console.log(query)

        const result = await db.query(query, params) //querying the DB for updating the row

       
        if (result.rowCount === 0) //if no element match the specified id => 404
            return res.status(404).send("Not Found")

        res.send(result.rows[0]) //else, return the updated version
    }
    catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})

router.delete("/:id", async (req, res) => {
    const response = await db.query(`DELETE FROM "products" WHERE _id= $1`, [ req.params.id ])

    if (response.rowCount === 0)
        return res.status(404).send("Not Found")
    
    res.send("OK")
})


router.post("/:id/upload", upload.single("product"), async (req, res, next) => {

    try {
      await fs.writeFile(path.join(imagePath, `${req.params.id}.png`), req.file.buffer)
      
      req.body = {
        image_url: `http://127.0.0.1:${port}/image/products/${req.params.id}.png`
      }

      let params = []
      let query = 'UPDATE "products" SET '
      for (bodyParamName in req.body) {
          query += // for each element in the body I'll add something like parameterName = $Position
              (params.length > 0 ? ", " : '') + //I'll add a coma before the parameterName for every parameter but the first
              bodyParamName + " = $" + (params.length + 1) // += Category = $1 

          params.push(req.body[bodyParamName]) //save the current body parameter into the params array
          
      }

      params.push(req.params.id) //push the id into the array
      query += " WHERE _id = $" + (params.length) + " RETURNING *" 
      console.log(query)

      const result = await db.query(query, params) //querying the DB for updating the row

     
      if (result.rowCount === 0) //if no element match the specified id => 404
          return res.status(404).send("Not Found")

      res.send(result.rows[0]) //else, return the updated version
      
    } catch (error) {
      next(error)
    }
  
  })

module.exports = router