import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormulaModule } from './modules/formula/formula.module';

@Module({
    imports: [FormulaModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
