import { Injectable } from "@nestjs/common";
import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";

import { mathjax } from '@mathjax/src/mjs/mathjax.js';
import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js';
import { TeX } from '@mathjax/src/mjs/input/tex.js';
import { MathML } from '@mathjax/src/mjs/input/mathml.js';
import { AsciiMath } from '@mathjax/src/mjs/input/asciimath.js';
import { CHTML } from '@mathjax/src/mjs/output/chtml.js';

@Injectable()
export class HtmlRenderer implements Renderer {
    private adaptor = liteAdaptor();

    constructor() {
        RegisterHTMLHandler(this.adaptor);
    }

    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'html';
    }

    async render(dto: FormulaDto): Promise<Record<string, any>> {
        const { inputType = 'TeX', formula, scale = 1 } = dto;

        let InputJax;
        if (inputType === 'TeX') {
            InputJax = new TeX();
        } else if (inputType === 'MathML') {
            InputJax = new MathML();
        } else if (inputType === 'AsciiMath') {
            InputJax = new AsciiMath({});
        }

        // 配置CHTML输出器，优化样式显示
        const out = new CHTML({
            // 缩放因子，控制公式大小
            scale: scale,
            // 让数学文本继承页面字体
            mtextInheritFont: true,
            // 让错误消息继承页面字体
            merrorInheritFont: true,
            // 保持MathML中的间距
            mathmlSpacing: true,
            // 跳过某些属性处理
            skipAttributes: { 'mathcolor': true, 'mathbackground': true }
        });
        const doc = mathjax.document(formula, { InputJax, OutputJax: out });
        const node = await doc.convertPromise(formula, { display: true });
        const html = this.adaptor.outerHTML(node);
        let css = '';

        // 提取MathJax生成的CSS样式
        if (out.styleSheet) {
            const styleSheet = out.styleSheet(doc);
            css = this.adaptor.cssText(styleSheet as any);
        }

        // 创建包含内联CSS的完整HTML字符串
        // 使用div容器包裹，确保结构完整性
        const combinedHtml = `<div class="mathjax-container">
  <style>
${css}
  </style>
${html}
</div>`

        return {
            html,
            css: css.trim(),
            combinedHtml
        };
    }
}