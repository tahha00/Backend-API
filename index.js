const express = require("express")
const fs = require("fs")
const app = express()
const port = 3000

const logger = require("./logger")

app.use(express.json())
app.use(logger)

// ! DATA IMPORT

let fruitData = undefined

// FruityAPI ids are not increasing integers. We weed to find the max id, then we can
// simply increment this number to ensure a unique id for new fruit we add
let ids = undefined
let maxId = undefined

fs.readFile("./fruits.json", "utf-8", (err, data) => {
  if (err) {
    res.json({
      success: false,
      message: err,
    })
  } else {
    fruitData = JSON.parse(data)
    ids = fruitData.map((fruit) => fruit.id)
    maxId = Math.max(...ids)
  }
})

// ! ROUTES

app.get("/", (req, res) => {
  res.send("Hello Fruity")
})

app.get("/fruits", (req, res) => {
  console.log("hello")
  res.send(fruitData)
})

app.get("/fruits/:name", (req, res) => {
  const name = req.params.name.toLowerCase()
  const fruit = fruitData.filter((fruit) => fruit.name.toLowerCase() === name)
  if (fruit === undefined) {
    res.status(404).send("No fruit found")
  } else {
    res.send(fruit)
  }
})

app.post("/fruits", (req, res) => {
  try {
    // first check if a fruit with the name specified by the user already exists
    const fruit = fruitData.find((fruit) => fruit.name.toLowerCase() === req.body.name.toLowerCase())

    if (fruit !== undefined) {
      // fruit already exists -> conflict response code returned
      res.status(409).send("The fruit already exists.")
    } else {
      // fruit does not already exist. Increment the maxId and add it to
      // the data sent to the server by the user
      maxId += 1
      req.body.id = maxId

      // add the fruit to the list of fruits
      fruitData.push(req.body)

      const updatedFruitData = JSON.stringify(fruitData, null, 2)
      fs.writeFile("./fruits.json", updatedFruitData, "utf-8", (err) => {
        if (err) {
          console.log(err)
        } else {
          // Return successfully created status code and echo the new fruit back to the user
          res.status(201).json({
            success: true,
            message: req.body,
          })
        }
      })
    }
  } catch (err) {
    res.json({
      suceess: false,
      message: err,
    })
  }
})

app.delete("/fruits/:name", (req, res) => {
  try {
    // First check if fruit exists
    const name = req.params.name.toLowerCase()
    const fruitIndex = fruitData.findIndex((fruit) => fruit.name.toLowerCase() == name)

    if (fruitIndex == -1) {
      // Fruit cannot be found, return 404
      res.status(404).send("The fruit doesn't exist.")
    } else {
      // Fruit found. Use the array index found to remove it from the array
      fruitData.splice(fruitIndex, 1)

      const updatedFruitData = JSON.stringify(fruitData, null, 2)
      fs.writeFile("./fruits.json", updatedFruitData, "utf-8", (err) => {
        if (err) {
          console.log(err)
        } else {
          // Return successfully created status code and echo the new fruit back to the user
          res.sendStatus(204)
        }
      })
    }
  } catch (err) {
    res.json({
      suceess: false,
      message: err,
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
