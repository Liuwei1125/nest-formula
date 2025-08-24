import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { FormulaService } from './formula.service';
import { FormulaDto } from './dto/formula.dto';


@Controller('formula')
export class FormulaController {
    constructor(private readonly formulaService: FormulaService) { }

    @Get()
    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    render(
        @Query() dto: FormulaDto
    ) {
        console.log(dto);
        return this.formulaService.render(dto);
    }
    
}
