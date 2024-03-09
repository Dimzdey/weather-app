import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'

import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { bufferLogs: true })

    app.useLogger(app.get(Logger))
    app.useGlobalInterceptors(new LoggerErrorInterceptor())
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    const openApiConfig = new DocumentBuilder()
        .setTitle('Weather API')
        .setDescription('The Weather API description')
        .setVersion('1.0')
        .build()

    const document = SwaggerModule.createDocument(app, openApiConfig)
    SwaggerModule.setup('api', app, document)

    const configService = app.get<ConfigService>(ConfigService)
    const port = configService.get<number>('port')

    await app.listen(port)
}

void bootstrap()
