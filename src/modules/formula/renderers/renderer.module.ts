import { Module } from "@nestjs/common";
import { MmlRenderer } from "./renderer/mml.renderer";
import { PngRenderer } from "./renderer/png.renderer";
import { SvgRenderer } from "./renderer/svg.renderer";
import { HtmlRenderer } from "./renderer/html.renderer";
import { RendererFactory } from "./renderer.factory";
import { OssModule } from '../modules/oss.module';

@Module({
    imports: [OssModule.forRoot({})],
    providers: [
        HtmlRenderer,
        MmlRenderer,
        PngRenderer,
        SvgRenderer,
        {
            provide: 'RENDERERS',
            useFactory: (html, mml, png, svg) => [html, mml, png, svg],
            inject: [HtmlRenderer, MmlRenderer, PngRenderer, SvgRenderer],
        },
        RendererFactory
    ],
    exports: [
        // HtmlRenderer,
        // MmlRenderer,
        // PngRenderer,
        // SvgRenderer,
        RendererFactory
    ],
})
export class RendererModule { }