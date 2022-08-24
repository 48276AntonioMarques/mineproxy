'use strict'
const net = require('net')
const port = process.env.PORT

const server = new net.Server()

server.listen(port, () => { console.log(`Server listening at localhost:${port}`) })

const redirect = {
    host: `${process.env.host}`,
    port: process.env.out_port
}
console.log(redirect)

server.on('connection', (socket) => {
    console.log('A new connection has been established.')
    const client = net.Socket()

    client.connect(redirect, () => {
        console.log('The connection reached origin.')
    })

    socket.on('data', (chunk) => {
        client.write(chunk)
    })

    client.on('data', (chunk) => {
        socket.write(chunk)
    })

    socket.on('error', (err) => {
        console.log("Socket error:", err)
        client.destroy(err)
        client.unref()
    })

    client.on('error', (err) => {
        console.log("Socket error:", err)
        socket.destroy(err)
        socket.unref()
    })

    socket.on('end', () => {
        client.end()
    })

    client.on('end', () => {
        socket.end()
    })
})