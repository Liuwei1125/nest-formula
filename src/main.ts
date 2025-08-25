import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
    // 预先配置ConfigModule，使其能够处理环境变量
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env', '.env.local', '.env.example'],
    });
    
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
