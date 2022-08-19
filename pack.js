const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const resolve = (dir) => {
  return path.join(__dirname, dir);
};

// 执行参数
const argvs = process.argv[2] ? process.argv[2] : "prod";
// 模式
const mode = { prod: "build:prod", dev: "build:dev" };

// 次级文件夹名
let secFolder = `en_${argvs}_${getData()}`;

// 配置参数
const config = {
  // 需要创建的主文件夹
  createFolder: resolve("./dist-ssr"),
  // 需要创建的次级文件夹
  createSecFolder: resolve(`./dist-ssr/${secFolder}`),
  // 需要复制的文件夹名称列表
  copyFolder: [".nuxt", "static"],
  // 需要复制的文件名称列表
  copyFile: [
    "yarn.lock",
    "package.json",
    "nuxt.config.js",
    argvs == "prod" ? ".env.production" : ".env.development",
  ],
  // 打包模式
  env: mode[argvs],
};

packingFilter(config.createFolder, config.createSecFolder);

/**
 * 打包
 * @param {string} path 源文件夹
 * @param {string} secPath 次级源文件夹
 */
function packingFilter(path, secPath) {
  const isWin32 = process.platform === "win32";
  const npm = isWin32 ? "npm.cmd" : "npm";
  let build = spawn(npm, ["run", config.env], {});

  build.stdout.on("data", (data) => {
    console.log(data + "");
  });

  build.stderr.on("data", (data) => {
    console.error(data + "");
  });

  build.on("close", (code) => {
    if (code) {
      console.log("error: 打包失败");
    } else {
      console.log("success: 打包成功");

      emptyDir(path);
      rmEmptyDir(path, 1);
      createFolder(path, secPath);
    }
  });
}

/**
 * 创建文件夹并复制
 * @param {string} path 源文件夹
 * @param {string} secPath 次级源文件夹
 */
function createFolder(path, secPath) {
  try {
    fs.mkdirSync(path, "0755");
    fs.mkdirSync(secPath, "0755");

    // 复制文件夹
    config.copyFolder.forEach((item) => {
      cpSync(resolve(item), `${secPath}\/${item}`);
    });

    // 复制文件
    config.copyFile.forEach((item) => {
      copyIt(resolve(item), `${secPath}\/${item}`);
    });

    console.log("success >>>>>>>>>");
  } catch (error) {
    console.log(error);
    console.log("failed >>>>>>>>>");
  }
}

/**
 * 删除文件夹下所有文件
 * @param {string} path 源文件夹
 */
function emptyDir(path) {
  try {
    const files = fs.readdirSync(path);
    files.forEach((file) => {
      const filePath = `${path}/${file}`;
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        emptyDir(filePath);
      } else {
        fs.unlinkSync(filePath);
        // console.log(`删除${file}文件成功`);
      }
    });
  } catch (error) {}
}

/**
 * 删除文件夹下所有空文件夹
 * @param {string} path 源文件夹
 * @param {Number} level 清除等级
 * level 0: 清除除自身文件夹的所有文件夹
 * level 1: 清除所有文件夹包括自身
 */
function rmEmptyDir(path, level = 1) {
  try {
    const files = fs.readdirSync(path);
    if (files.length > 0) {
      let tempFile = 0;
      files.forEach((file) => {
        tempFile++;
        rmEmptyDir(`${path}/${file}`, 1);
      });
      if (tempFile === files.length && level !== 0) {
        fs.rmdirSync(path);
      }
    } else {
      level !== 0 && fs.rmdirSync(path);
    }
  } catch (error) {}
}

/**
 * 文件夹复制到文件夹
 * @param {string} source 源文件夹
 * @param {string} destination 目标文件夹
 */
function cpSync(source, destination) {
  let major = process.version.match(/v([0-9]*).([0-9]*)/)[1];
  /** 特性版本 */
  let minor = process.version.match(/v([0-9]*).([0-9]*)/)[2];

  // node版本16.7.0以上使用fs.cp
  if (Number(major) < 16 || (Number(major) == 16 && Number(minor) < 7)) {
    // 如果存在文件夹 先递归删除该文件夹
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true });
    }
    // 新建文件夹 递归新建
    fs.mkdirSync(destination, { recursive: true });
    // 读取源文件夹
    let rd = fs.readdirSync(source);
    for (const fd of rd) {
      // 循环拼接源文件夹/文件全名称
      let sourceFullName = source + "/" + fd;
      // 循环拼接目标文件夹/文件全名称
      let destFullName = destination + "/" + fd;
      // 读取文件信息
      let lstatRes = fs.lstatSync(sourceFullName);
      // 是否是文件
      if (lstatRes.isFile()) fs.copyFileSync(sourceFullName, destFullName);
      // 是否是文件夹
      if (lstatRes.isDirectory()) cpSync(sourceFullName, destFullName);
    }
  } else {
    fs.cpSync(source, destination, { force: true, recursive: true });
  }
}

/**
 * 文件复制到文件夹
 * @param {string} source 源文件夹
 * @param {string} destination 目标文件夹
 */
function copyIt(source, destination) {
  fs.writeFileSync(destination, fs.readFileSync(source));
}

/**
 * 获取时间格式字符串
 */
function getData() {
  let timestamp = Date.parse(new Date());
  let time = toString(timestamp).length === 13 ? timestamp / 1000 : timestamp;
  let date = new Date(time);
  let Y = date.getFullYear();
  let M = date.getMonth() + 1;
  let D = date.getDate();
  return `${Y}${M < 10 ? "0" + M : M}${D < 10 ? "0" + D : D}`;
}
