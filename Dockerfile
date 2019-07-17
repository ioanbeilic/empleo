# FROM 310161846004.dkr.ecr.eu-west-1.amazonaws.com/devops-base-node-image:10.15.0
FROM node:alpine

ARG VCS_REF
ARG BUILD_DATE
ARG user=node
ARG group=node
ARG uid=1000
ARG gid=1000
ARG app_service_port=3000


LABEL maintainer="empleo Team" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://gitlab.univ.corp/empleo/empleo-cv-svc" \
      org.label-schema.docker.dockerfile="/Dockerfile"


ENV WORKING_DIR=/usr/src/app
RUN mkdir -p ${WORKING_DIR}
RUN chown -R ${user}:${group} "$WORKING_DIR"
WORKDIR ${WORKING_DIR}

RUN echo strict-ssl=false > .npmrc
RUN echo registry=https://nexus.univ.corp/repository/npm-global/ >> .npmrc

USER ${user}

COPY package.json ${WORKING_DIR}
COPY package-lock.json ${WORKING_DIR}
RUN npm ci

COPY . ${WORKING_DIR}
RUN npm run build

RUN rm -rf node_modules && npm install --production
RUN npm cache clean --force

EXPOSE ${app_service_port}

CMD ["npm", "start"]
