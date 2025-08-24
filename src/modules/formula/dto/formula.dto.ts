import { IsString, IsOptional, IsNotEmpty, IsIn, IsNumber, Min, Max } from "class-validator";

export class FormulaDto {

    // 产品线名称
    @IsOptional()
    @IsString()
    product: string;

    // 产品线密钥
    @IsOptional()
    @IsString()
    token: string;

    // 输入类型
    @IsIn(['TeX', 'MathML', 'AsciiMath'])
    inputType: 'TeX' | 'MathML' | 'AsciiMath';

    // 输出类型
    @IsIn(['html', 'svg', 'png', 'mml'])
    outputType: 'html' | 'svg' | 'png' | 'mml';

    // 待转换公式
    @IsNotEmpty()
    @IsString()
    formula: string;

    // 缩放比例
    @IsOptional()
    @Min(0.1)
    @Max(100)
    @IsNumber()
    scale: number = 1;
    
}
