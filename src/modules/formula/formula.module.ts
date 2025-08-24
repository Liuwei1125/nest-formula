import { Module } from '@nestjs/common';
import { FormulaService } from './formula.service';
import { FormulaController } from './formula.controller';
import { RendererModule } from './renderers/renderer.module';

@Module({
    imports: [RendererModule],
    controllers: [FormulaController],
    providers: [FormulaService],
})
export class FormulaModule { }
