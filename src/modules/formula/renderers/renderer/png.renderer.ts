import { Injectable } from "@nestjs/common";
import { Renderer } from "../interfaces/renderer.inerface";
import { FormulaDto } from "src/modules/formula/dto/formula.dto";
import * as sharp from 'sharp';
import { SvgRenderer } from './svg.renderer';
import { OssService } from '../../services/oss.service';

@Injectable()
export class PngRenderer implements Renderer {
    constructor(
        private readonly svgRenderer: SvgRenderer,
        private readonly ossService: OssService
    ) {}

    supports(dto: FormulaDto): boolean {
        return dto.outputType === 'png';
    }

    async render(dto: FormulaDto): Promise<Record<string, any>> {
        const { scale = 1, uploadToCloud = false, filename = 'formula-image' } = dto;
        // 首先使用SvgRenderer获取SVG内容
        const svgResult = await this.svgRenderer.render(dto);
        const svgContent = svgResult.svg;
        
        if (!svgContent) {
            throw new Error('Failed to generate SVG content');
        }

        // 将SVG转换为Buffer
        const svgBuffer = Buffer.from(svgContent);

        // 计算目标DPI（基于72dpi基准）
        const density = Math.max(1, Number(scale)) * 72;

        // 使用sharp将SVG转换为PNG
        const pngBuffer = await sharp(svgBuffer, { density })
            .png()
            .toBuffer();

        // 生成base64编码的PNG
        const base64Png = pngBuffer.toString('base64');
        const base64WithPrefix = `data:image/png;base64,${base64Png}`;

        // 获取图像尺寸信息
        const dimensions = await this.getImageDimensions(pngBuffer);

        // 准备返回结果
        const result: Record<string, any> = {
            png: pngBuffer,
            base64: base64WithPrefix,
            dpi: density,
            dimensions
        };

        // 如果需要上传到OSS
        if (uploadToCloud) {
            try {
                const uploadResult = await this.ossService.uploadPNG(
                    pngBuffer,
                    filename,
                    {
                        meta: {
                            'x-oss-meta-scale': scale.toString(),
                            'x-oss-meta-dpi': density.toString(),
                            'x-oss-meta-width': dimensions.width.toString(),
                            'x-oss-meta-height': dimensions.height.toString(),
                        }
                    }
                );
                
                // 添加OSS上传结果
                result.oss = uploadResult;
            } catch (error) {
                // 上传失败不应影响主功能，只记录错误
                console.error('OSS上传失败:', error);
            }
        }

        return result;
    }

    // 辅助函数：获取图像尺寸
    async getImageDimensions(buffer: Buffer): Promise<{width: number, height: number, size: number, format: string}> {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width || 0, 
            height: metadata.height || 0,
            size: metadata.size || 0,   
            format: metadata.format || 'png'
        };
    }
}