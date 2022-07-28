/**
 * @module：Compiler
 * @description 简单模板编译工具
 */

// 引入依赖>>
const fse = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const prettier = require('prettier');
const glob = require('glob');

const ui = new inquirer.ui.BottomBar();

const alias = {
  '.npmrc2': '.npmrc',
  'tsconfig2.json': 'tsconfig.json',
  '.gitignore2': '.gitignore',
};

class Compiler {
  /**
   * 编译器构造函数
   * @param {String} templateRoot 模板读取基础路径
   * @param {String} outputRoot 模板编译目标目录基础目录
   */
  constructor(templateRoot, outputRoot) {
    this.templateRoot = templateRoot;
    this.outputRoot = outputRoot;
    this.formatFilter = null;
    this.outTemplate = null;
    this.ignoreFilter = null;
  }

  /**
   * 将制定模板编译成目标文件
   * @param {String} file  模板文件路径 可以是绝对路径或者相对于tmplBase的相对路径
   * @param {String}  target 目标文件路径 可以是绝对路径或者相对于targetBase的相对路径
   * @param {Object} obj   模板数据
   * @param {Boolean} exists  是否检测冲突（当文件存在时不进行生成)
   */
  compileTo(file, target, obj, format, force) {
    if (!path.isAbsolute(file)) {
      file = path.join(this.templateRoot, file);
    }
    if (!path.isAbsolute(target)) {
      target = path.join(this.outputRoot, target);
    }
    force = true;
    const name = target.replace(/\\/g, '/').split(this.outputRoot.replace(/\\/g, '/')).pop();
    if (!fse.existsSync(target) || force === true) {
      const ext = path.extname(file);
      const dir = path.dirname(target);
      fse.ensureDirSync(dir);
      if (/\.(png|jpg|jpeg|gif|webp|bmp|ico|jpeg)$/.test(ext)) {
        return fse.copyFileSync(file, target);
      }
      const template = this.compileAs(file, obj, format);
      fse.writeFileSync(target, template);
      console.log(' 编译  > ' + name);
    } else {
      ui.log.write(` 编译 目标文件已存在 > ${name}`);
    }
  }

  /**
   * 设置格式化过滤函数
   */
  shouldFormat(handler) {
    this.formatFilter = handler;
    return this;
  }

  /**
   * 是否需要忽略文件
   */
  shouldFilter(handler) {
    this.ignoreFilter = handler;
    return this;
  }

  /**
   * 设置模板上下文
   * @param context
   */
  setTemplate(context) {
    this.outTemplate = context;
    return this;
  }

  /**
   * 编译
   * @param {Object} data 编译上下文
   */
  compile(data, field) {
    const ignoreFilter = this.ignoreFilter;
    const files = glob.sync(this.templateRoot + '/**/**', { dot: true }).filter((file) => fse.lstatSync(file).isFile());
    files.forEach((file) => {
      if (ignoreFilter && ignoreFilter(file)) {
        return;
      }
      if (field) {
        // 如果存在优先级文件
        const ext = path.extname(file);
        const id = file.replace(ext, '');
        const realId = id + '.' + field + ext;
        if (fse.existsSync(realId)) {
          return;
        }
      }
      let template = this.templateOf(file, this.outTemplate);
      if (file.indexOf(field) > -1) {
        template = template.replace('.' + field + '.', '.');
      }
      this.compileTo(file, template, data, this.formatFilter);
    });
    return this;
  }

  /**
   * 编译模板
   * @param {String} file  模板文件路径
   * @param {Object} obj  模板数据
   * @param {Boolean} format 是否格式化代码 默认为:true
   */
  compileAs(file, obj, format) {
    const template = String(fse.readFileSync(file));
    return this.compileString(template, obj, format, file);
  }

  compileString(template, data, format, filename) {
    Object.keys(data).forEach((k) => {
      const value = data[k];
      const element = new RegExp(`\\/\\*\\s*?${k}\\s*\\*\\s*\\/`);
      if (k.indexOf('GENERATE-') > -1) {
        template = template.replace(element, value);
      } else {
        template = template.replace(new RegExp(`\\$${k}\\$`, 'g'), value);
      }
    });
    format = typeof format === 'function' ? format(filename.replace(/\\/g, '/')) : format;
    if (format !== false) {
      return this.format(filename, template);
    }
    return template;
  }

  /**
   * 注释变量编译模式
   */
  compileVar(file, context) {
    let content = String(fse.readFileSync(file), 'utf8');
    ui.log.write(` Reference ${file}`);
    const min = content.replace(/\n|\t|\s/g, '');
    Object.keys(context).forEach((k) => {
      const element = new RegExp(`\\/\\*\\s*${k}\\s*\\*\\s*\\/`);
      const element2 = new RegExp(`\\{\\/\\*\\s*${k}\\s*\\*\\s*\\/\\}`);
      const value = context[k];
      if (min.indexOf(value.replace(/\n|\t|\s/g, '')) < 0) {
        if (element2.test(content)) {
          content = content.replace(element2, `${value}{/* ${k}*/}`);
        } else {
          content = content.replace(element, `${value}/* ${k}*/`);
        }
      }
    });
    fse.writeFileSync(file, this.format(file, content));
  }

  /**
   * 获取输出文件名
   * @param {String} file 文件名
   * @param {Function/Object} outTemplate 输出文件模板
   */
  templateOf(file, outTemplate) {
    const name = file.replace(/\\/g, '/').split(this.templateRoot.replace(/\\/g, '/')).pop();
    const basename = name.replace('/', '');
    let output = name;
    if (alias[basename]) {
      output = name.replace(basename, alias[basename]);
    }
    if (typeof outTemplate === 'function') {
      output = outTemplate(name, file);
    } else if (outTemplate && typeof outTemplate === 'object') {
      Object.keys(outTemplate).forEach((k) => output = output.replace(k, outTemplate[k]));
    }
    output = output[0] === '/' ? output.slice(1) : output;
    return output;
  }


  /**
   * 格式化编译后的代码
   */
  format(file, content) {
    if (/\.(js|jsx|tsx|ts)/.test(path.extname(file))) {
      return prettier.format(content, {
        semi: true,
        filepath: file,
        singleQuote: true,
        jsxSingleQuote: true,
        jsxBracketSameLine: false,
        printWidth: 120,
        trailingComma: 'all',
      });
    }
    return content;
  }
}

// 公布引用
module.exports = Compiler;
