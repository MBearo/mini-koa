// let b=require('./a.js')
const fs=require('fs')
const path =require('path')
const vm=require('vm')

function Module(p){
  this.id=p //当前模块的标识，也就是绝对路径
  this.exports={} //每个模块都有exports属性，添加一个
  this.loaded=false  //是否已经加载完
}

//对文件内容进行头尾包装
Module.wrapper = ['(function(exports,require,module){', '})']

//所有的加载策略
Module._extensions = {
  '.js': function (module) { //读取js文件，增加一个闭包
      let script = fs.readFileSync(module.id, 'utf8');
      let fn = Module.wrapper[0] + script + Module.wrapper[1];//包装在一个闭包里
      vm.runInThisContext(fn).call(module.exports, module.exports, myRequire, module);//通过runInThisContext()方法执行不污染全局
      return module.exports;

  },
  '.json': function (module) {
      return JSON.parse(fs.readFileSync(module.id, 'utf8')); //读取文件
  }
}
Module._cacheModule = {} //存放缓存

Module._resolveFileName = function (moduleId) { //根据传入的路径参数返回一个绝对路径的方法
    let p = path.resolve(moduleId);
    if (!path.extname(moduleId)) { //如果没有传文件后缀
        let arr = Object.keys(Module._extensions); //将对象的key转成数组
        for (let i = 0; i < arr.length; i++) { //循坏数组添加后缀
            let file = p + arr[i];
            try {
                fs.accessSync(file); //查看文件是否存在，存在的就返回
                return file;
            } catch (e) {
                console.log(e); //不存在报错
            }
        }
    } else {
        return p; //如果已经传递了文件后缀，直接返回绝对路径
    }
}

Module.prototype.load = function (filepath) { //模块加载的方法
    let ext = path.extname(filepath);
    let content = Module._extensions[ext](this);
    return content;
}

function myRequire(moduleId) { //自定义的myRequire方法
    let p = Module._resolveFileName(moduleId); //将传递进来的模块标示转成绝对路径
    if (Module._cacheModule[p]) { //如果模块已经存在
        return Module._cacheModule[p].exports; //直接返回编译和执行之后的对象
    }
    let module = new Module(p); //模块不存在，先创建一个新的模块对象
    let content = module.load(p); //模块加载后的内容
    Module._cacheModule[p] = module;
    module.exports = content;
    return module.exports;
}

let b = myRequire('./a.js');

console.log(b)