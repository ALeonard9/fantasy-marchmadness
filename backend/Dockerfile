FROM node:carbon
# Create app directory
RUN apt-get -y install carbon

ADD crontab /etc/cron.d/scrape

RUN chmod 0644 /etc/cron.d/scrape

RUN touch /var/log/cron.log

CMD cron

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
