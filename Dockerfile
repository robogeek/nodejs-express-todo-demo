FROM node:14.8

# Replicate the configuration present in package.json
ENV PORT="80"
ENV SEQUELIZE_CONNECT="models/sequelize-sqlite.yaml"

RUN apt-get update -y \
    && apt-get -y install curl python build-essential git \
        apt-utils ca-certificates sqlite3

RUN mkdir /app /app/models /app/public /app/routes /app/views
COPY models/ /app/models/
COPY public/ /app/public/
COPY routes/ /app/routes/
COPY views/ /app/views/
COPY *.mjs package.json /app/

WORKDIR /app

RUN npm install --unsafe-perm

CMD [ "node", "./app.mjs" ]
