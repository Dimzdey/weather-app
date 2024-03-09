import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { WeatherData } from '../interfaces'

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(_, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data: WeatherData) => {
                // I will assume that we need only current data as there no requirements on what exactly should be mapped
                // The only two places that contains this fields are either current or daily
                // Also this will make 'part' query parameter useless
                if (!data?.current) {
                    return {}
                }

                const { current } = data

                const response = {
                    sunrise: current.sunrise,
                    sunset: current.sunset,
                    temp: current.temp,
                    feels_like: current.feels_like,
                    pressure: current.pressure,
                    humidity: current.humidity,
                    uvi: current.uvi,
                    wind_speed: current.wind_speed,
                }
                return response
            })
        )
    }
}
