import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import { createOssClient, OssModuleOptions } from '../config/oss.config';
import { OssService } from '../services/oss.service';

/**
 * OSS模块 - 提供阿里云OSS集成功能
 */
@Module({
  imports: [ConfigModule],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule {
  /**
   * 静态方法用于动态配置OSS模块
   */
  static forRoot(options: OssModuleOptions = {}): DynamicModule {
    // 创建OSS客户端Provider
    const ossClientProvider: Provider = {
      provide: 'OSS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return createOssClient(configService);
      },
      inject: [ConfigService],
    };

    // 创建自定义名称的客户端Provider（如果指定）
    let customClientProvider: Provider | null = null;
    if (options.clientName) {
      customClientProvider = {
        provide: options.clientName,
        useFactory: (configService: ConfigService) => {
          return createOssClient(configService);
        },
        inject: [ConfigService],
      };
    }

    // 构建模块定义
    const moduleDefinition: DynamicModule = {
      module: OssModule,
      global: options.isGlobal || false,
      imports: [ConfigModule],
      providers: [ossClientProvider, OssService],
      exports: [ossClientProvider, OssService],
    };

    // 添加自定义客户端Provider（如果有）
    if (customClientProvider) {
      moduleDefinition.providers?.push(customClientProvider);
      moduleDefinition.exports?.push(customClientProvider);
    }

    return moduleDefinition;
  }

  /**
   * 静态方法用于异步配置OSS模块
   */
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<OssModuleOptions> | OssModuleOptions;
    inject?: any[];
    isGlobal?: boolean;
  }): DynamicModule {
    const { useFactory, inject = [], isGlobal = false } = options;

    // 创建配置Provider
    const configProvider: Provider = {
      provide: 'OSS_MODULE_OPTIONS',
      useFactory,
      inject,
    };

    // 创建OSS客户端Provider
    const ossClientProvider: Provider = {
      provide: 'OSS_CLIENT',
      useFactory: (configService: ConfigService, moduleOptions: OssModuleOptions) => {
        return createOssClient(configService);
      },
      inject: [ConfigService, 'OSS_MODULE_OPTIONS'],
    };

    return {
      module: OssModule,
      global: isGlobal,
      imports: [ConfigModule],
      providers: [configProvider, ossClientProvider, OssService],
      exports: [ossClientProvider, OssService],
    };
  }
}