var spawn = require('child_process').spawn;             // 注册nodeJs子进程
free = spawn('hexo', ['server', '--silent']);              // 注入命令参数

free.stdout.on('data', function (data) { 
    console.log('standard output:\n' + data);           // 捕获标准输出并将其打印到控制台 
}); 

free.stderr.on('data', function (data) { 
    console.log('standard error output:\n' + data);     // 捕获标准错误输出并将其打印到控制台  
}); 

free.on('exit', function (code, signal) { 
    console.log('child process eixt ,exit:' + code);    // 注册子进程关闭事件
});
