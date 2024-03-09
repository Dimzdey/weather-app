/* eslint-disable import/namespace */
import * as Joi from 'joi'

export interface DbConfig {
    url: string
}

export interface OpenWeatherConfig {
    apiKey: string
    url: string
}

export interface Config {
    port: number
    db: DbConfig
    openWeather: OpenWeatherConfig
}

export const validationSchema = Joi.object({
    PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
    OPEN_WEATHER_API_KEY: Joi.string().required(),
    OPEN_WEATHER_URL: Joi.string().required(),
})

export default (): Config => ({
    port: parseInt(process.env.PORT, 10),
    db: {
        url: process.env.DATABASE_URL,
    },
    openWeather: {
        apiKey: process.env.OPEN_WEATHER_API_KEY,
        url: process.env.OPEN_WEATHER_URL,
    },
})
