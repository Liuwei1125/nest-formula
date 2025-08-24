import { FormulaDto } from '../../dto/formula.dto';


export interface Renderer {

    /**
     * 渲染公式
     * @param dto 公式
     * @returns 渲染结果
     */
    render(dto: FormulaDto): Promise<Record<string, any>>;

    /**
     * 支持的输出类型
     * @param dto 公式
     * @returns 是否支持
     */
    supports(dto: FormulaDto): boolean;
}