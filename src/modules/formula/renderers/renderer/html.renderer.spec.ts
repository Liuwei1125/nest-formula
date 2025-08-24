import { Test, TestingModule } from '@nestjs/testing';
import { HtmlRenderer } from './html.renderer';
import { FormulaDto } from '../../dto/formula.dto';

// Mock MathJax dependencies
jest.mock('@mathjax/src/mjs/mathjax.js', () => ({
    mathjax: {
        document: jest.fn().mockImplementation(() => ({
            convertPromise: jest.fn().mockResolvedValue({
                type: 'element',
                name: 'mjx-container',
                attributes: {},
                children: [],
            }),
        })),
    },
}));

jest.mock('@mathjax/src/mjs/adaptors/liteAdaptor.js', () => ({
    liteAdaptor: jest.fn().mockImplementation(() => ({
        outerHTML: jest.fn().mockReturnValue('<mjx-container>test</mjx-container>'),
    })),
}));

jest.mock('@mathjax/src/mjs/handlers/html.js', () => ({
    RegisterHTMLHandler: jest.fn(),
}));

jest.mock('@mathjax/src/mjs/input/tex.js', () => ({
    TeX: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@mathjax/src/mjs/input/mathml.js', () => ({
    MathML: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@mathjax/src/mjs/input/asciimath.js', () => ({
    AsciiMath: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@mathjax/src/mjs/output/chtml.js', () => ({
    CHTML: jest.fn().mockImplementation(() => ({
        styleSheet: jest.fn().mockReturnValue('mock-mathjax-css'),
    })),
}));

describe('HtmlRenderer', () => {
    let renderer: HtmlRenderer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HtmlRenderer],
        }).compile();

        renderer = module.get<HtmlRenderer>(HtmlRenderer);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('supports', () => {
        it('should return true for html output type', () => {
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };
            expect(renderer.supports(dto)).toBe(true);
        });

        it('should return false for non-html output types', () => {
            const svgDto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'svg',
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };
            const pngDto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'png',
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };
            const mmlDto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'mml',
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };
            const otherDto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'other' as any,
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };

            expect(renderer.supports(svgDto)).toBe(false);
            expect(renderer.supports(pngDto)).toBe(false);
            expect(renderer.supports(mmlDto)).toBe(false);
            expect(renderer.supports(otherDto)).toBe(false);
        });
    });

    describe('render', () => {
        const mockFormula = 'E = mc^2';

        it('should render TeX formula to HTML', async () => {
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: mockFormula,
                product: 'test',
                token: 'test',
                scale: 1,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });

        it('should handle rendering errors gracefully', async () => {
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: 'invalid-formula',
                product: 'test',
                token: 'test',
                scale: 1,
            };

            // Mock the convertPromise to throw an error
            const mathjaxMock = jest.requireMock('@mathjax/src/mjs/mathjax.js');
            const originalDocument = mathjaxMock.mathjax.document;
            
            try {
                // Override the document method temporarily
                mathjaxMock.mathjax.document = jest.fn().mockReturnValue({
                    convertPromise: jest.fn().mockRejectedValue(new Error('Rendering failed'))
                });
                
                await expect(renderer.render(dto)).rejects.toThrow('Failed to render formula: Rendering failed');
            } finally {
                // Restore the original implementation
                mathjaxMock.mathjax.document = originalDocument;
            }
        });

        it('should render MathML formula to HTML', async () => {
            const dto: FormulaDto = {
                inputType: 'MathML',
                outputType: 'html',
                formula: mockFormula,
                product: 'test',
                token: 'test',
                scale: 1,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });

        it('should render AsciiMath formula to HTML', async () => {
            const dto: FormulaDto = {
                inputType: 'AsciiMath',
                outputType: 'html',
                formula: mockFormula,
                product: 'test',
                token: 'test',
                scale: 1,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });

        it('should use TeX as default inputType when not specified', async () => {
            // Create a partial DTO without inputType
            const partialDto = {
                outputType: 'html' as const,
                formula: mockFormula,
                product: 'test',
                token: 'test',
                scale: 1,
            };

            // Cast to FormulaDto to test default behavior
            const dto = partialDto as FormulaDto;

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });

        it('should handle complex TeX formulas', async () => {
            const complexFormula = '\\frac{d}{dx}\\int_{a}^{x} f(t) dt = f(x)';
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: complexFormula,
                product: 'test',
                token: 'test',
                scale: 1,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });

        it('should handle empty formula string', async () => {
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: '',
                product: 'test',
                token: 'test',
                scale: 1,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });
        
        it('should use specified scale parameter', async () => {
            const dto: FormulaDto = {
                inputType: 'TeX',
                outputType: 'html',
                formula: mockFormula,
                product: 'test',
                token: 'test',
                scale: 1.5,
            };

            const result = await renderer.render(dto);

            expect(result).toEqual({
                html: '<mjx-container>test</mjx-container>',
                css: 'mock-mathjax-css',
                combinedHtml: `<div class="math-container">\n<style>mock-mathjax-css</style>\n<mjx-container>test</mjx-container>\n</div>`
            });
        });
    });
});