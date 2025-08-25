import { Injectable } from "@nestjs/common";
import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";

import { mathjax } from '@mathjax/src/mjs/mathjax.js';
import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js';
import { SerializedMmlVisitor } from '@mathjax/src/mjs/core/MmlTree/SerializedMmlVisitor.js';
import { STATE } from '@mathjax/src/mjs/core/MathItem.js';
import { TeX } from '@mathjax/src/mjs/input/tex.js';
import { MathML } from '@mathjax/src/mjs/input/mathml.js';
import { AsciiMath } from '@mathjax/src/mjs/input/asciimath.js';
import { CHTML } from '@mathjax/src/mjs/output/chtml.js';

@Injectable()
export class MmlRenderer implements Renderer {
    private adaptor = liteAdaptor();

    constructor() {
        RegisterHTMLHandler(this.adaptor);
    }
    
    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'mml';
    }

    async render(dto: FormulaDto): Promise<Record<string, any>> {
        const { inputType = 'TeX', formula } = dto;

        let InputJax;
        if (inputType === 'TeX') {
            InputJax = new TeX();
        } else if (inputType === 'MathML') {
            InputJax = new MathML();
        } else if (inputType === 'AsciiMath') {
            InputJax = new AsciiMath({});
        }

        const out = new CHTML();
        const doc = mathjax.document('', { InputJax, OutputJax: out });
        const node = await doc.convertPromise(formula, {
            display: true,
            end: STATE.CONVERT
        });

        const visitor = new SerializedMmlVisitor();
        const mml = visitor.visitTree(node);

        return Promise.resolve({
            mml
        });
    }
}