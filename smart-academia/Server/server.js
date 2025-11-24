const express=require('express')
const app=express()


let port=3000
app.listen(port,()=>{
    console.log(`My server is listening to the ${port} port`)
})

app.get('/',(req,res)=>{
    console.log("get request")
})1                                                     