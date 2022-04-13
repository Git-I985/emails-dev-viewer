FROM node:17

WORKDIR /usr/src/app

COPY . ./

RUN npm install

CMD EMAILS_DIST_DIR='./dist' BASE_URL='/email-viewer/' npm run start

EXPOSE 8080
