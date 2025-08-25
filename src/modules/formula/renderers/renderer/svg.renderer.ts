import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";
import { Injectable } from '@nestjs/common';

import { mathjax } from '@mathjax/src/mjs/mathjax.js';
import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js';
import { TeX } from '@mathjax/src/mjs/input/tex.js';
import { MathML } from '@mathjax/src/mjs/input/mathml.js';
import { AsciiMath } from '@mathjax/src/mjs/input/asciimath.js';
import { SVG } from '@mathjax/src/mjs/output/svg.js';

// 导入 SVGO
import { optimize } from 'svgo';

@Injectable()
export class SvgRenderer implements Renderer {
    private adaptor = liteAdaptor();

    constructor() {
        RegisterHTMLHandler(this.adaptor);
    }

    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'svg';
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

        // 配置 SVG 输出选项，添加缩放比例
        const out = new SVG({
            fontCache: 'none',
            scale: scale // 应用缩放比例
        });
        const doc = mathjax.document('', { InputJax, OutputJax: out });
        const node = await doc.convertPromise(formula, { display: true });

        // 获取完整的 HTML 内容
        let html = this.adaptor.outerHTML(node);
        
        // 提取纯 SVG 内容
        let pureSvg = html;
        const svgMatch = html.match(/<svg[^>]*>.*<\/svg>/s);
        if (svgMatch) {
            pureSvg = svgMatch[0];
            
            // 使用 SVGO 优化 SVG
            const optimizedSvg = optimize(pureSvg, {
                multipass: true,
                plugins: [
                    // 保留 viewBox 属性（对于缩放很重要）
                    { name: 'removeViewBox' },
                    // 移除注释
                    'removeComments',
                    // 移除 XML 声明
                    'removeXMLProcInst',
                    // 移除 DOCTYPE
                    'removeDoctype',
                    // 合并重复的属性
                    'mergePaths',
                    // 压缩路径数据
                    'convertPathData',
                    // 移除不必要的属性
                    'removeEmptyAttrs',
                    'removeEmptyText',
                    'removeUnknownsAndDefaults',
                    // 清理 ID（如果不需要的话）
                    // { name: 'cleanupIDs', active: true }
                ]
            });
            
            pureSvg = optimizedSvg.data;
        }

        return Promise.resolve({
            svg: pureSvg
        });
    }
}