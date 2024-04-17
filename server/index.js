import { Server } from "socket.io";
import connection from "./database/db.js";
import { getDocument,updateDocument } from "./controller/documentController.js";

const PORT = 9000;

connection()

const io = new Server(PORT, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST']
    }
}) 

io.on('connection', socket => {
    console.log("connected to client")

    socket.on('get-document', async(documentId) => {

        const document =await getDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document', document?.data)
        
        socket.on('send-changes', (delta) => {
            console.log(delta)
            socket.broadcast.to(documentId).emit('receive-changes', delta)
        })

        socket.on('save-document',async(data)=>{
            await updateDocument(documentId,data)
        })

    })
})