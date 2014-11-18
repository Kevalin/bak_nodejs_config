<h3>The function of program backups config-files of node js servers to a focusing bak-servers.</h3>

<p>My thinking is logining each server to exec some shell commands that it can do everything for my mind.</p>
<h3>Step:</h3>
    1.get current git-version-number.The command is "tail -1 /root/node_version.log | awk '{printf $8}'".
    2.loing server and exec tar command.The command is "tar -zvcf /tmp/syyx_conf_" + ip + "_" + git_number + ".tar.gz --exclude=font. /root/syyx_conf".There has a two variables that is ip-address and git_number from the first.
    3.I use stfp to download the tar.gz package.
    4.remove the temporary tar.gz pachage.
    
<h3>Usage:</h3>
    host.js----main server-conf,include IP-address,port,username,password and encrypt type.
    The function "do_all" has two parameters that are remote and local.
        remote is the path of remoted tar.gz.
        local is the path of saving tar.gz.
    The finaly,we can get some file like this syyx_conf_192.168.20.152_m_141023.008.tar.gz.
    Well,you can run program to node app.js.
