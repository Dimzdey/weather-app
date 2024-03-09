/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'

jest.mock('@nestjs/axios', () => ({
    ...jest.requireActual('@nestjs/common'),
    HttpService: jest.fn().mockImplementation(() => ({
        axiosRef: {
            get: jest.fn(),
        },
    })),
}))

jest.mock('./prisma/prisma.service', () => ({
    PrismaService: jest.fn().mockImplementation(() => ({
        $queryRawUnsafe: jest.fn(),
        weather: {
            upsert: jest.fn(),
        },
    })),
}))

jest.mock('@nestjs/config', () => ({
    ConfigService: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
    })),
}))

describe('AppService', () => {
    let service: AppService
    let httpService: HttpService
    let prismaService: PrismaService
    let configService: ConfigService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppService, HttpService, PrismaService, ConfigService],
        }).compile()

        service = module.get<AppService>(AppService)
        httpService = module.get<HttpService>(HttpService)
        prismaService = module.get<PrismaService>(PrismaService)
        configService = module.get<ConfigService>(ConfigService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('getWeatherData', () => {
        it('should return weather data', async () => {
            const mockData = [{ data: { temp: 20 } }]
            jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue(mockData)

            const result = await service.getWeatherData(1, 1)
            expect(result).toEqual(mockData[0].data)
        })

        it('should return weather data with part', async () => {
            const mockData = [{ data: { temp: 20 } }]
            jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue(mockData)

            const result = await service.getWeatherData(1, 1, ['current'])
            expect(result).toEqual(mockData[0].data)
        })

        it('should throw NotFoundException when no data found', async () => {
            jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValue([])

            await expect(service.getWeatherData(1, 1)).rejects.toThrow('Weather data not found')
        })
    })

    describe('saveWeatherData', () => {
        it('should save weather data', async () => {
            const mockData = { temp: 20 }
            jest.spyOn(service as any, 'getWeatherFromOpenWeather').mockResolvedValue(mockData)
            jest.spyOn(service as any, 'saveWeatherToDatabase').mockResolvedValue(undefined)

            await service.saveWeatherData(1, 1)
            expect(service['getWeatherFromOpenWeather']).toHaveBeenCalledWith(1, 1, undefined)
            expect(service['saveWeatherToDatabase']).toHaveBeenCalledWith(1, 1, mockData)
        })
    })

    describe('saveWeatherToDatabase', () => {
        it('should save weather data to database', async () => {
            const mockData = { temp: 20 }
            jest.spyOn(prismaService.weather, 'upsert').mockResolvedValue({} as any)

            await service['saveWeatherToDatabase'](1, 1, mockData as any)
            expect(prismaService.weather.upsert).toHaveBeenCalledWith({
                where: { lat_lon: { lat: 1, lon: 1 } },
                update: {
                    data: mockData,
                    lat: 1,
                    lon: 1,
                },
                create: {
                    data: mockData,
                    lat: 1,
                    lon: 1,
                },
            })
        })
    })

    describe('getWeatherFromOpenWeather', () => {
        it('should get weather data from OpenWeather', async () => {
            const mockData = { temp: 20 }
            const mockResponse = {
                data: mockData,
                status: 200,
            }
            jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(mockResponse)
            jest.spyOn(configService, 'get').mockReturnValue({
                apiKey: 'test',
                url: 'http://test.com',
            })

            const result = await service['getWeatherFromOpenWeather'](1, 1, [])
            expect(result).toEqual(mockData)
        })
    })
})
