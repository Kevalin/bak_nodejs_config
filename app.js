var authinfo = require('./host.js')
var Connection = require('ssh2');
var cipher = require('./node_modules/cipher.js')
var async = require('./node_modules/async')

var get_conn_info = function (info) {
    var all_info = []
    var key = authinfo['security'].ssh
    for (var i = 0; i < info.host.length; ++i) {
        var host = {
            host : info.host[i],
            port : info.port,
            username : info.username,
            password : cipher.decipher(info.password, key),
        }
        all_info.push(host)
    }
    return all_info
}

// var get_ip_address = function() {
//     var ifaces = os.networkInterfaces()
//     for (var dev in ifaces) {
//         ifaces[dev].forEach(function(v){
//             if (v.family == 'IPv4' && v.address.match(/192.168.10./)) {
//                 return v.address
//             }
//         })
//     }
// }

var do_all = function(ip, port, username, password, remote, local, git_number) {
    async.series([
        //tar syyx_conf file
        function(cb) {
            var conn1 = new Connection()
            var cmd = "tar -zvcf /tmp/syyx_conf_" + ip + "_" + git_number + ".tar.gz --exclude=font /root/syyx_conf"
            conn1.on('ready', function() {
                conn1.exec(cmd, function(err, stream) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        stream.on('exit', function() {
                            conn1.end()
                            console.log("tar syyx_conf_" + ip + "_" + git_number + ".tar.gz success!")
                            cb(null)
                        })
                    }
                })
            }).connect({
                host : ip,
                port : port,
                username : username,
                password : password
            }) 
        },
        //use sftp to get tar file
        function(cb) {
            var conn2 = new Connection()
            conn2.on('ready', function(){
                conn2.sftp(function(err, sftp) {
                    var remote_file = remote + "/" + "syyx_conf_" + ip + "_" + git_number + ".tar.gz"
                    var local_file = local + "/" + "syyx_conf_" + ip + "_" + git_number + ".tar.gz"
                    sftp.fastGet(remote_file, local_file, function(err){
                        if (err) {
                            console.log(err)
                        }
                        else {
                            sftp.end()
                            conn2.end()
                            console.log("Get syyx_conf_" + ip + "_" + git_number + ".tar.gz success!") 
                            cb(null)
                        }
                    })
                })
            }).connect({
                host : ip,
                port : port,
                username : username,
                password : password
            })
        },
        // rm temporary tar file
        function(cb) {
            var conn3 = new Connection()
            var cmd = "rm -f /tmp/syyx_conf_" + ip + "_" + git_number + ".tar.gz"
            conn3.on('ready', function() {
                conn3.exec(cmd, function(err, stream) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        stream.on('exit', function() {
                            conn3.end()
                            console.log("rm " + ip + " temporary file success!")
                            cb(null)
                        })
                    }
                })
            }).connect({
                host : ip,
                port : port,
                username : username,
                password : password
            })
        },
    ], function(err) {
        if (err) throw err
    })
}

var allinfo = get_conn_info(authinfo['info'])
for (var i = 0; i < allinfo.length; ++i) {
    (function(t) {
        var v = allinfo[i]
        async.waterfall([
            function(cb) {
                cb(null, v.host, v.port, v.username, v.password)
            },
            function(ip, port, username, password, cb) {
                var conn = new Connection()
                var cmd = "tail -1 /root/node_version.log | awk '{printf $8}'"
                conn.on('ready', function() {
                    conn.exec(cmd, function(err, stream) {
                        if (err) {
                            console.log(err)
                            cb(err)
                        }
                        else {
                            stream.on('exit', function() {
                                conn.end()
                            }).on('data', function(data) {
                                cb(null, data.toString())
                            }) 
                        }
                    })
                }).connect({
                    host : ip,
                    port : port,
                    username : username,
                    password : password
                })
            },
            function(git_number, cb) {
                do_all(v.host, v.port, v.username, v.password, '/tmp', './', git_number)
                cb(null)
            }
        ], function(err) {if (err) throw err})
    })(i)
}