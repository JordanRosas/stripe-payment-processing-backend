const cors = require("cors")
const express = require("express")
const stripe = require("stripe")("sk_test_")
const { v4: uuidV4 } = require('uuid');
const app = express()

//middleware
app.use(express.json())
app.use(cors())

//routes
app.get("/", (req, res) => {
    res.send("Stripe tutorial working")
})

app.post("/payment", (req, res) => {
    const {product, token} = req.body

    console.log("PRODUCT", product)
    console.log("PRICE", product.price)
    //Make sure the user isn't charged twice
    const idempotencyKey = uuidV4()
    
    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer:customer.id,
            receipt_email: token.email,
            description:product.name,
        }, {idempotencyKey})
    }).then(result => res.status(200).json(result))
    .catch(err => console.log(err))

})
//listener
const port = process.env.PORT || 3001
app.listen(port, () => console.log('listening @ port ' + port ))
