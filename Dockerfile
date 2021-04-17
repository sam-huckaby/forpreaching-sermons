# I used the following guide
# https://mherman.org/blog/dockerizing-an-angular-app/

# base image
FROM node:12 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install
RUN yarn global add @angular/cli

# add app
COPY . /app

# generate build
RUN ng build --prod --output-path=dist

### The above is run in an intermediary container so that we can use the benefits of node.js/yarn
### We then copy the produced results into our nginx container, which is super fast.

# base image
FROM nginx:1.16.0-alpine

# Copy the nginx SPA config from the repo directly
COPY nginx.config /etc/nginx/conf.d/default.conf
# Copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html

# Expose 80 so that nginx-proxy knows where to send traffic 
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
