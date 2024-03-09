import { IsArray, IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator'

import { allowedPartFields } from './allowed-part-fields'

export class RequestDto {
    @IsNumber()
    @Max(90)
    @Min(-90)
    lat: number

    @IsNumber()
    @Max(180)
    @Min(-180)
    lon: number

    @IsOptional()
    @IsArray()
    @IsIn(allowedPartFields, { each: true })
    part?: string[]
}
