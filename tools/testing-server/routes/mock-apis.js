const fs = require('fs-extra')
const path = require('path')
const fp = require('fastify-plugin')
const { PassThrough } = require('stream')
const zlib = require('zlib')
const assert = require('assert')
const { paths } = require('../constants')
const { retrieveReplayData } = require('../utils/replay-buffer')

/**
 * Fastify plugin to apply routes to the asset server that are used in various
 * test cases.
 * @param {import('fastify').FastifyInstance} fastify the fastify server instance
 * @param {TestServer} testServer test server instance
 */
module.exports = fp(async function (fastify, testServer) {
  // Proxy endpoints
  fastify.route({
    method: ['GET', 'POST'],
    url: '/beacon/*',
    onRequest: async (request, reply) => {
      // reply.hijack()
      request.raw.url = request.raw.url.replace('/beacon/', '/')
      testServer.bamServer.server.routing(request.raw, reply.raw)
      await reply
    },
    handler: async function (request, reply) {
      await reply
    }
  })
  fastify.route({
    method: ['GET', 'POST'],
    url: '/assets/*',
    onRequest: async (request, reply) => {
      // reply.hijack()
      request.raw.url = request.raw.url.replace('/assets/', '/build/')
      testServer.assetServer.server.routing(request.raw, reply.raw)
      await reply
    },
    handler: async function (request, reply) {
      await reply
    }
  })

  fastify.get('/health', async function (request, reply) {
    reply.code(204).send()
  })
  fastify.get('/slowscript', {
    compress: false
  }, (request, reply) => {
    const abort = parseInt(request.query.abort || 0, 10)
    const delay = parseInt(request.query.delay || 200, 10)

    setTimeout(() => {
      if (abort) {
        reply.raw.destroy()
        return
      }
      reply.send('window.slowScriptLoaded=1')
    }, delay)
  })
  fastify.get('/lazyscript', {
    compress: false
  }, (request, reply) => {
    const delay = parseInt(request.query.delay || 0, 10)
    const content = request.query.content || ''

    setTimeout(() => {
      reply.send(content)
    }, delay)
  })
  fastify.get('/slowimage', {
    compress: false
  }, (request, reply) => {
    const delay = parseInt(request.query.delay || 0, 10)

    setTimeout(() => {
      reply
        .type('image/png')
        .send(
          fs.createReadStream(
            path.join(paths.testsAssetsDir, 'images/square.png')
          )
        )
    }, delay)
  })
  fastify.get('/image', {
    compress: false
  }, (request, reply) => {
    reply
      .type('image/png')
      .send(
        fs.createReadStream(
          path.join(paths.testsAssetsDir, 'images/square.png')
        )
      )
  })
  fastify.get('/abort', {
    compress: false
  }, (request, reply) => {
    setTimeout(() => {
      reply.send('foo')
    }, 300)
  })
  fastify.put('/timeout', {
    compress: false
  }, (request, reply) => {
    setTimeout(() => {
      reply.send('foo')
    }, 300)
  })
  fastify.post('/echo', {
    compress: false
  }, (request, reply) => {
    reply.send(request.body)
  })

  fastify.get('/jsonp', {
    compress: false
  }, (request, reply) => {
    const delay = parseInt(request.query.timeout || 0, 10)
    const cbName = request.query.callback || request.query.cb || 'callback'

    setTimeout(() => {
      if (request.query.plain) {
        reply.type('text/plain').send(cbName + '("taco")')
      } else {
        reply.type('text/javascript').send(cbName + '({name: "taco"})')
      }
    }, delay)
  })
  fastify.get('/xhr_with_cat/*', {
    compress: false
  }, (request, reply) => {
    reply
      .header('X-NewRelic-App-Data', 'foo')
      .send('xhr with CAT ' + new Array(100).join('data'))
  })
  fastify.get('/xhr_no_cat', {
    compress: false
  }, (request, reply) => {
    reply.send('xhr no CAT')
  })
  fastify.get('/echo-headers', {
    compress: false
  }, (request, reply) => {
    reply.send(request.headers)
  })
  fastify.post('/postwithhi/*', {
    compress: false
  }, (request, reply) => {
    if (request.body === 'hi!') {
      reply.send('hi!')
    } else {
      reply.send('bad agent! - got body = "' + request.body + '"')
    }
  })
  fastify.get('/json', {
    compress: false
  }, (request, reply) => {
    reply.send({ text: 'hi!' })
  })
  fastify.get('/js', {
    compress: false
  }, (request, reply) => {
    reply.type('text/javascript').send('console.log(\'hi\')')
  })
  fastify.get('/text', {
    compress: false
  }, (request, reply) => {
    const length = parseInt(request.query.length || 10, 10)
    reply.send('x'.repeat(length))
  })
  fastify.post('/formdata', {
    compress: false
  }, async (request, reply) => {
    try {
      assert.deepEqual(request.body, { name: 'bob', x: '5' })
      reply.send('good')
    } catch (e) {
      reply.send('bad')
    }
  })
  fastify.get('/slowresponse', {
    compress: false
  }, (request, reply) => {
    const stream = new PassThrough()
    reply.send(stream)

    stream.write('x'.repeat(8192))
    setTimeout(() => {
      stream.write('y'.repeat(8192))
      stream.end()
    }, 250)
  })
  fastify.get('/gzipped', {
    compress: false
  }, (request, reply) => {
    const stream = new PassThrough()
    reply.header('Content-Encoding', 'gzip').send(stream)

    const gzip = zlib.createGzip()
    gzip.pipe(stream)
    gzip.end('x'.repeat(10000))
  })
  fastify.get('/chunked', {
    compress: false
  }, (request, reply) => {
    const stream = new PassThrough()
    reply.header('Transfer-Encoding', 'chunked').send(stream)

    stream.write('x'.repeat(10000))
    stream.end()
  })
  fastify.get('/empty404', {
    compress: false
  }, async (request, reply) => {
    reply.code(404).send('')
  })
  fastify.get('/dt/*', {
    compress: false
  }, (request, reply) => {
    reply.code(200).send('')
  })
  fastify.get('/session-replay', async (request, reply) => {
    const replayData = await retrieveReplayData(request.query.sessionId)
    if (replayData) {
      reply.code(200)
      return replayData
    } else {
      reply.code(404)
      return ''
    }
  })
})
