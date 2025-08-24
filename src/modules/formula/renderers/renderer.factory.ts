import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Renderer } from "./interfaces/renderer.inerface";
import { FormulaDto } from "../dto/formula.dto";
import { dot } from "node:test/reporters";


export class RendererFactory {
    private renderers: Renderer[] = [];

    constructor(
        @Inject('RENDERERS') renderers: Renderer[],
    ) {
        this.renderers = renderers;
    }

    getRenderer(dto: FormulaDto) {
        const renderer = this.renderers.find(renderer => renderer.supports(dto));
        if (!renderer) {
            throw new HttpException(
                `Renderer not found for output type ${dto.outputType}`,
                HttpStatus.BAD_REQUEST
            );
            // throw new Error(`Renderer not found for output type ${dot.outputType}`);
        }
        return renderer;
    }
}