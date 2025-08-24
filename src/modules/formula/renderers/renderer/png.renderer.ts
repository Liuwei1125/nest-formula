import { Injectable } from "@nestjs/common";
import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";

@Injectable()
export class PngRenderer implements Renderer {
    render(dto: FormulaDto): Promise<Record<string, any>> {
        return Promise.resolve({
            png: 'png'
        });
    }
    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'png';
    }
}