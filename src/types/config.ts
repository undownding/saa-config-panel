import {
    IsString,
    IsNumber,
    IsArray,
    ValidateNested,
    IsDateString,
    IsNotEmpty
} from 'class-validator';
import {Type} from 'class-transformer';

// 坐标位置类型
export class Position {
    @IsNumber({}, {message: 'x1 must be a number'})
    x1!: number;

    @IsNumber({}, {message: 'y1 must be a number'})
    y1!: number;

    @IsNumber({}, {message: 'x2 must be a number'})
    x2!: number;

    @IsNumber({}, {message: 'y2 must be a number'})
    y2!: number;
}

// 更新数据类型
export class UpdateData {

    @IsString({message: 'questName must be a string'})
    @IsNotEmpty({message: 'questName cannot be empty'})
    questName!: string;

    @IsNumber({}, {message: 'onlineWidth must be a number'})
    onlineWidth!: number;

    @IsNumber({}, {message: 'onlineHeight must be a number'})
    onlineHeight!: number;

    @ValidateNested()
    @Type(() => Position)
    stuff!: Position;

    @ValidateNested()
    @Type(() => Position)
    chasm!: Position;

    @IsNumber({}, {message: 'linkId must be a number'})
    linkId!: number;

    @IsNumber({}, {message: 'linkCatId must be a number'})
    linkCatId!: number;
}

// 兑换码类型
export class RedeemCode {
    @IsString({message: 'code must be a string'})
    @IsNotEmpty({message: 'code cannot be empty'})
    code!: string;

    @IsDateString({}, {message: 'expiredAt must be a valid ISO date string'})
    expiredAt!: string; // ISO 8601 date string
}

// 游戏配置类型
export class GameConfig {

    @IsString({message: 'version must be a string'})
    @IsNotEmpty({message: 'version cannot be empty'})
    version!: string;

    @ValidateNested()
    @Type(() => UpdateData)
    updateData!: UpdateData;

    @IsArray({message: 'redeemCodes must be an array'})
    @ValidateNested({each: true})
    @Type(() => RedeemCode)
    redeemCodes!: RedeemCode[];
}

// API 响应类型
export interface ConfigResponse {
    status: 'ok' | 'error';
    data?: GameConfig;
    message?: string;
    timestamp: string;
}

// API 错误响应类型
export interface ConfigErrorResponse {
    error: string;
    message: string;
    timestamp: string;
}

// 验证结果类型
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
