'use strict'
const net = require('net')
const args = process.argv.slice(2)
const port = args[0]

const proxy = new net.Server()

const targetedServer = {
    host: `${args[1]}`,
    port: args[2]
}

console.log(`targetedServer: ${targetedServer.host}:${targetedServer.port}`)

proxy.listen(port, () => { console.log(`Server listening at port: ${port}`) })

proxy.on('connection', (clientSocket) => {
    console.log('A new connection has been established.')
    const targetedSocket = net.Socket()

    targetedSocket.connect(targetedServer, () => {
        console.log('The connection reached origin.')
    })

    clientSocket.on('data', (chunk) => {
        targetedSocket.write(chunk)
    })

    targetedSocket.on('data', (chunk) => {
        clientSocket.write(chunk)
        console.log("Data sent to client")
    })

    clientSocket.on('error', (err) => {
        console.log("Socket error:", err)
        targetedSocket.destroy(err)
        targetedSocket.unref()
    })

    targetedSocket.on('error', (err) => {
        console.log("Socket error:", err)
        clientSocket.destroy(err)
        clientSocket.unref()
    })

    clientSocket.on('end', () => {
        targetedSocket.end()
    })

    targetedSocket.on('end', () => {
        clientSocket.end()
    })
})
