import { HttpService } from '@nestjs/axios'
import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import axios, { AxiosError } from 'axios'

import { OpenWeatherConfig } from './config/config'
import { OpenWeatherErrorResponse, WeatherData } from './interfaces'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
    private readonly logger = new Logger(this.constructor.name)
    constructor(
        private readonly httpService: HttpService,
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService
    ) {}

    async getWeatherData(lat: number, lon: number, part?: string[]): Promise<WeatherData | null> {
        const excludePart = !!part ? part.map(field => ` - '${field}'`).join('') : ''

        const result = await this.prismaService.$queryRawUnsafe<{ data: WeatherData }[]>(
            `SELECT data ${excludePart} as data FROM "Weather" WHERE lat = $1 AND lon = $2`,
            lat,
            lon
        )

        if (!result?.length) {
            throw new NotFoundException('Weather data not found')
        }

        return result[0].data
    }

    async saveWeatherData(lat: number, lon: number, part?: string[]): Promise<void> {
        const weatherData = await this.getWeatherFromOpenWeather(lat, lon, part)
        await this.saveWeatherToDatabase(lat, lon, weatherData)
    }

    private async saveWeatherToDatabase(
        lat: number,
        lon: number,
        weatherData: WeatherData
    ): Promise<void> {
        try {
            await this.prismaService.weather.upsert({
                where: { lat_lon: { lat, lon } },
                update: {
                    data: weatherData as unknown as Prisma.JsonObject,
                    lat,
                    lon,
                },
                create: {
                    data: weatherData as unknown as Prisma.JsonObject,
                    lat,
                    lon,
                },
            })
        } catch (err: unknown) {
            this.logger.error(err)
            throw new InternalServerErrorException((err as Error).message)
        }
    }

    // I will keep fetching the data from the OpenWeather API in this service for simplicity
    // But in a real-world application, I would create a separate service for this
    private async getWeatherFromOpenWeather(
        lat: number,
        lon: number,
        part: string[]
    ): Promise<WeatherData> {
        try {
            const { apiKey, url } = this.configService.get<OpenWeatherConfig>('openWeather')

            const response = await this.httpService.axiosRef.get<WeatherData>(url, {
                params: {
                    lat,
                    lon,
                    exclude: part?.length ? part.join(',') : undefined,
                    appid: apiKey,
                },
            })

            return response.data
        } catch (err) {
            this.logger.error(err)
            const error = err as Error | AxiosError
            if (!axios.isAxiosError(error)) {
                throw new InternalServerErrorException(error.message)
            }

            const axiosError = error as AxiosError<OpenWeatherErrorResponse>

            if (axiosError.response) {
                throw new HttpException(
                    axiosError.response.data.message,
                    axiosError.response.status
                )
            }
        }
    }
}
