/**
 * @module WeChatDevTool
 * @description 微信开发者工具小工具
 */
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

class WeChatDevtool {
  /**
   * 执行小程序命令行
   */
  exec(command) {
    const dir = '/Applications/wechatwebdevtools.app/Contents/MacOS/';
    if (fs.existsSync(dir)) {
      childProcess.execFileSync(path.join(dir, 'cli'), (command || '').split(' '), {

      });
    }
  }

  /**
   * 使用小程序开发者工具打开指定项目
   * @param { String } project 项目路径
   */
  open(project) {
    this.exec(`-o ${project}`);
  }
}

module.exports = new WeChatDevtool();
