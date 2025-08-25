// 若找不到 @nestjs/config 模块，可能需要安装该依赖，安装命令：npm install @nestjs/config
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';

/**
 * 创建OSS客户端实例
 */
export const createOssClient = (configService: ConfigService): OSS => {
  // 从环境变量或配置中获取OSS配置
  const ossConfig = {
    region: configService.get<string>('OSS_REGION', 'oss-cn-hangzhou'),
    accessKeyId: configService.get<string>('OSS_ACCESS_KEY_ID'),
    accessKeySecret: configService.get<string>('OSS_ACCESS_KEY_SECRET'),
    bucket: configService.get<string>('OSS_BUCKET'),
  };

  // 验证必要的配置
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
    throw new Error('OSS配置不完整，请检查环境变量：OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_BUCKET');
  }

  return new OSS(ossConfig);
};

/**
 * OSS模块配置接口
 */
export interface OssModuleOptions {
  /**
   * 是否全局注册
   */
  isGlobal?: boolean;
  /**
   * 自定义客户端名称
   */
  clientName?: string;
}