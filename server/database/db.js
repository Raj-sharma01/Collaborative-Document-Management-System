import mongoose from "mongoose";

const PASSWORD="SvH0HbnSkILr598H"

const connection=()=>{
    mongoose.connect(`mongodb+srv://RajSharma:${PASSWORD}@docs-clone.ddahicv.mongodb.net/?retryWrites=true&w=majority`)

    mongoose.connection.once('open',()=>{
        console.log('connected to database')
    })
    
    mongoose.connection.on('error',(err)=>{
        console.log("we got an error -> ",err)
    })
}


export default connection