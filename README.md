# Draft
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


[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_host='orion.cbtm6ac1xc5y.us-east-1.rds.amazonaws.com'
[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_user='mm_user'
[root@ip-172-31-82-42 fantasy-marchmadness]# export mm_mysql_pass='<insert later>'

/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d

## Amazon linux
yum UPDATE
sudo yum install -y docker
sudo service docker start
