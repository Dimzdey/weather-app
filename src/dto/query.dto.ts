import { Transform } from 'class-transformer'
import { IsArray, IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator'

import { allowedPartFields } from './allowed-part-fields'

export class QueryDto {
    @IsNumber()
    @Max(90)
    @Min(-90)
    @Transform(({ value }: { value: string }) => parseFloat(value))
    lat: number

    @IsNumber()
    @Max(180)
    @Min(-180)
    @Transform(({ value }: { value: string }) => parseFloat(value))
    lon: number

    // I really don't understand why this query should be present
    // If the part will be 'current' the response will be empty
    // Also it is not clear how the data should be saved and what part of the response should be intercepted and mapped
    @IsOptional()
    @IsArray()
    @IsIn(allowedPartFields, { each: true })
    @Transform(({ value }: { value: string }) =>
        value.split(',').map((item: string) => item.trim())
    )
    part?: string[]
}
