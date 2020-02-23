[![Build Status](https://travis-ci.com/ALeonard9/fantasy-marchmadness.svg?branch=master)](https://travis-ci.com/ALeonard9/fantasy-marchmadness)

# fantasy-marchmadness
Individual player point tracker for March Madness. Challenge your friends to a fantasy sports style league for college basketball.



## Setup
1) Clone the repo.
2) docker-compose up -d (for local mode) -or- /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d (for prod)
3) Connect to the database and run the mm-sql-init.sql script in the database folder.


yum update
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum makecache fast
yum install git
https://docs.docker.com/compose/install/#master-builds
/usr/local/bin/docker-compose up -d


[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_host='<string>'
[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_user='<string>
[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_pass='<string>'

/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d

## Amazon linux
yum UPDATE
sudo yum install -y docker
sudo service docker start

## Useful commands
Bring up just the database:
```docker-compose up -d mysql-dev```

SQL, drafting:
UPDATE `mm`.`player` SET `owner_id` = (select id from mm.owner where name = 'Adam'), `drafted_round` = '1' WHERE (`id` = '2');
