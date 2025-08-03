import Fastify from 'fastify'

const app = Fastify()

app.get('/ping', async (request, reply) => {
  return { pong: 'it works!' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Server listening at ${address}`)
})
