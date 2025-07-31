const swaggerAutogen = require('swagger-autogen')()

// Create wrapper files that include the path context
const fs = require('fs')

// Create temporary wrapper files
const createWrapper = (routePath, filePath) => {
  const wrapperContent = `
const express = require('express');
const router = express.Router();
const originalRouter = require('${filePath}');

// Mount the original router with the correct path prefix
router.use('${routePath.includes('/admin') ? routePath + '/auth' : routePath}', originalRouter);

module.exports = router;
`
  const wrapperPath = `./temp_${routePath.replace('/', '')}_wrapper.js`
  fs.writeFileSync(wrapperPath, wrapperContent)
  return wrapperPath
}

const routeMapping = {
  '/admin': './routes/authRoutes/adminAuth.js',
  '/auth': './routes/authRoutes/authRoutes.js',
  '/dau_mau': './routes/clickhouseRoutes/dauMauRoutes/dauMauRoutes.js',
  '/chart': './routes/clickhouseRoutes/chartRoutes/chartRoutes.js',
  '/real_topdata': './routes/clickhouseRoutes/topcontentRoutes/topcontentRoutes.js',
  '/subscibers': './routes/clickhouseRoutes/subsRoutes/subsRoutes.js',
  '/real_userview': './routes/clickhouseRoutes/userViewRoutes/userViewRoutes.js',
  '/real_durationroutes': './routes/clickhouseRoutes/durationRoutes/durationRoutes.js',
  '/real_search': './routes/clickhouseRoutes/searchRoutes/searchRoutes.js',
  '/hist_topdata': './routes/clickhouseRoutes/htopcontentRoutes/htopcontentRoutes.js',
  // '/hsubs': './routes/clickhouseRoutes/hsubsRoutes/hsubsRoutes.js',
  '/hist_userview': './routes/clickhouseRoutes/huserViewRoutes/huserViewRoutes.js',
  '/hist_durationroutes': './routes/clickhouseRoutes/hdurationRoutes/hdurationRoutes.js',
  '/hist_search': './routes/clickhouseRoutes/hsearchRoutes/hsearchRoutes.js',
  '/engagement_routes': './routes/clickhouseRoutes/engagementRoutes/engagementRoutes.js',
  '/freepaiduser_routes': './routes/clickhouseRoutes/freepaidRoutes/freepaidRoutes.js',
  '/activity': './routes/clickhouseRoutes/activityRoutes/activityRoutes.js',
  '/userdata': './routes/clickhouseRoutes/useractivityRoutes/useractivityRoutes.js',
  '/funnels':'./routes/clickhouseRoutes/funnelRoutes/funnelRoutes.js',
}

const doc = {
  info: {
    title: 'Dangal API',
    description: 'API documentation for Dangal application',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/api/v1',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    authorization: {
      type: 'apiKey',
      in: 'header',
      name: 'authorization',
      description: 'Enter your JWT token with Bearer prefix, e.g., Bearer eyJhbGciOi...'
    }
  },
  security: [
    {
      authorization: []
    }
  ]
}

const outputFile = './swagger_output_v1.json'

// Create wrapper files
const wrapperFiles = Object.entries(routeMapping).map(([routePath, filePath]) => 
  createWrapper(routePath, filePath)
)

swaggerAutogen(outputFile, wrapperFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!')

  const swaggerDoc = JSON.parse(fs.readFileSync(outputFile, 'utf8'))

  Object.keys(swaggerDoc.paths).forEach(path => {
    if (swaggerDoc.paths[path].post) {
      const post = swaggerDoc.paths[path].post

      const bodyParam = post.parameters?.find(p => p.in === 'body')
      
      if (bodyParam && bodyParam.schema && bodyParam.schema.properties) {
        const props = bodyParam.schema.properties
        
        // Update startDate if it exists and has generic value
        if (props.startDate && props.startDate.example === 'any') {
          props.startDate = {
            type: 'string',
            format: 'string',
            example: '2025-07-01 00:00:00',
            description: 'Start date in YYYY-MM-DD HH:mm:ss format'
          }
        }

        if (props.endDate && props.endDate.example === 'any') {
          props.endDate = {
            type: 'string',
            format: 'string',
            example: '2025-07-05 23:59:59',
            description: 'End date in YYYY-MM-DD HH:mm:ss format'
          }
        }

        if (props.email && props.email.example === 'any') {
          props.email = {
          type: 'string',
          format: 'email',
          example: 'example@gmail.com',
          description: 'Email address of the user'
        };
      }

        if (props.otp && props.otp.example === 'any') {
          props.otp = {
          type: 'string',
          format: 'numeric',
          example: '123456',
          description: 'One-time password sent to the user'
        };
      }

        if (props.password && props.password.example === 'any') {
          props.password = {
          type: 'string',
          format: 'password',
          example: 'Pass@123',
          description: 'User password (min 8 characters, must include letters, numbers, and symbols)'
        };
      }

        if (props.newpassword && props.newpassword.example === 'any') {
          props.newpassword = {
          type: 'string',
          format: 'password',
          example: 'NewPass@123',
          description: 'New password to update for the user'
        };
      }


        if (props.platform && props.platform.example === 'any') {
        props.platform = {
          type: 'string',
          example: '',
          description: 'Platform from which the request is made (e.g., web, android, ios)'
        };
      }


        if (props.keyword && props.keyword.example === 'any') {
        props.keyword = {
          type: 'string',
          example: '',
          description: 'Search keyword or query string'
        };
      }


      if (props.filters && props.filters.example === 'any') {
        props.filters = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', example: 'genre' },
              value: { type: 'string', example: 'Action' }
            }
          },
          example: [],
          description: 'Optional filters to narrow down the query results'
        };
      }

        if (props.startDate || props.endDate) {
          bodyParam.required = true
        }
      }
    }
  })
  
  fs.writeFileSync(outputFile, JSON.stringify(swaggerDoc, null, 2))
  
  // Clean up wrapper files
  wrapperFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  })
})
