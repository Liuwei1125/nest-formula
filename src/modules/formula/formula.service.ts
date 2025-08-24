import { Injectable } from '@nestjs/common';
import { RendererFactory } from './renderers/renderer.factory';
import { FormulaDto } from './dto/formula.dto';

@Injectable()
export class FormulaService {

    constructor(
        private readonly rendererFactory: RendererFactory
    ) { }

    render(dto: FormulaDto) {
        console.log(dto);
        const renderer = this.rendererFactory.getRenderer(dto);
        return renderer.render(dto);
    }

}
