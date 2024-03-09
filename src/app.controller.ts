import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger'

import { AppService } from './app.service'
import { ErrorResponseDto } from './dto/error-response.dto'
import { MessageResponseDto } from './dto/message-response.dto'
import { QueryDto } from './dto/query.dto'
import { RequestDto } from './dto/request.dto'
import { WeatherResponseDto } from './dto/response.dto'
import { ResponseFormatInterceptor } from './interceptors/response-format.interceptor'
import { WeatherData } from './interfaces'

@ApiTags('weather')
@Controller('weather')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOkResponse({ type: WeatherResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
    @UseInterceptors(ResponseFormatInterceptor)
    getWeather(@Query() query: QueryDto): Promise<WeatherData> {
        return this.appService.getWeatherData(query.lat, query.lon, query.part)
    }

    @Post()
    @ApiCreatedResponse({ type: WeatherResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
    async addWeatherData(@Body() body: RequestDto): Promise<MessageResponseDto> {
        await this.appService.saveWeatherData(body.lat, body.lon, body.part)
        return { message: 'Weather data saved' }
    }
}
