# NUXT打包后自动转移目录



​	**使用说明**

​	将pack.js文件放在nuxt项目根目录中



​	根目录执行 node pack prod



​	最后提示 success >>>>>>>>> 说明执行成功



​	**注意事项**	

​	Universal模式打包后移入/dist-ssr 文件夹，dist-ssr文件夹中自动创建环境日期格式	的次级文件夹，如不需要请去除createSecFolder参数



​	默认支持dev和prod模式，如需自定义请修改mode，注意保持env环境文件对应，打	包过程中仅有必要提示，如需显示进度条请自行修改



​	默认打包复制转移的文件及文件夹如下:

```
/.nuxt
/static
package.json
nuxt.config.js
.env
yarn.lock
```

