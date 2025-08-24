import { Injectable } from "@nestjs/common";
import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";

@Injectable()
export class MmlRenderer implements Renderer {
    render(dto: FormulaDto): Promise<Record<string, any>> {
        return Promise.resolve({
            mml: 'mml'
        });
    }
    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'mml';
    }
}