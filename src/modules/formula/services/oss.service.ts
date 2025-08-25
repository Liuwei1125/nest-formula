import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import { createOssClient } from '../config/oss.config';

/**
 * OSS服务 - 处理阿里云OSS文件上传相关功能
 */
@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private readonly ossClient: OSS;

  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject('OSS_CLIENT') private readonly customOssClient?: OSS,
  ) {
    // 使用自定义客户端或创建新客户端
    this.ossClient = customOssClient || createOssClient(configService);
  }

  /**
   * 上传PNG文件到OSS
   * @param buffer PNG文件的Buffer数据
   * @param filename 文件名
   * @param options 上传选项
   * @returns 上传结果，包含文件URL等信息
   */
  async uploadPNG(
    buffer: Buffer,
    filename: string,
    options?: {
      /**
       * 文件存储路径（不含文件名）
       */
      path?: string;
      /**
       * 自定义元数据
       */
      meta?: Record<string, string>;
      /**
       * 超时时间（毫秒）
       */
      timeout?: number;
    },
  ): Promise<{
    url: string;
    filename: string;
    key: string;
    size: number;
  }> {
    try {
      // 确保文件名以.png结尾
      if (!filename.endsWith('.png')) {
        filename = `${filename}.png`;
      }

      // 构建完整的OSS文件路径
      const basePath = options?.path || 'formula-images';
      const ossKey = `${basePath}/${Date.now()}-${filename}`;

      // 设置上传选项
      const uploadOptions: OSS.PutObjectOptions = {
        timeout: options?.timeout || 30000, // 默认30秒超时
        headers: {
          'Content-Type': 'image/png',
        },
      };

      // 添加元数据
      if (options?.meta) {
        uploadOptions.meta = options.meta;
      }

      // 执行上传
      const result = await this.ossClient.put(ossKey, buffer, uploadOptions);

      // 构建可访问的URL
      const url = this.ossClient.signatureUrl(ossKey, {
        expires: 3600 * 24 * 365, // 签名URL有效期（秒），默认为1年
      });

      this.logger.log(`PNG文件上传成功: ${ossKey}`);

      return {
        url,
        filename,
        key: ossKey,
        size: buffer.length,
      };
    } catch (error) {
      this.logger.error(`PNG文件上传失败: ${error.message}`, error.stack);
      throw new Error(`OSS上传失败: ${error.message}`);
    }
  }

  /**
   * 检查文件是否存在
   * @param key OSS文件路径
   * @returns 文件是否存在
   */
  async doesObjectExist(key: string): Promise<boolean> {
    try {
      await this.ossClient.head(key);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 删除OSS文件
   * @param key OSS文件路径
   */
  async deleteObject(key: string): Promise<void> {
    try {
      await this.ossClient.delete(key);
      this.logger.log(`文件已删除: ${key}`);
    } catch (error) {
      this.logger.error(`文件删除失败: ${error.message}`, error.stack);
      throw new Error(`OSS删除失败: ${error.message}`);
    }
  }

  /**
   * 获取OSS客户端实例（用于高级操作）
   */
  getClient(): OSS {
    return this.ossClient;
  }
}