import { config } from '@/config';
import { readFileSync } from 'node:fs';

// 读取本地文件并上传
async function uploadFile(filePath: string, apiUrl: string, apiKey: string) {
  try {
    // 使用 Node.js 的 fs 模块读取文件
    const fileData = readFileSync(filePath);
    // 将 Buffer 转换为 Blob
    const blob = new Blob([fileData], { type: 'text/markdown' });

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('file', blob, 'README.md');

    // 使用 fetch 上传文件
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        "content-type": "multipart/form-data"
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// 调用上传函数
const filePath = './README.md'; // 本地文件路径
const apiUrl = 'http://localhost:3000/api/upload'; // 上传接口URL
const apiKey = config.API_KEY; // API Key

uploadFile(filePath, apiUrl, apiKey);
