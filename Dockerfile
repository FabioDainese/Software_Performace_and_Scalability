FROM node:latest

EXPOSE 3001
EXPOSE 3000

WORKDIR /webapp
COPY . /webapp

# Sandbox part 
RUN apt-get update
RUN apt-get install gawk
RUN tar -xf firejail-0.9.68.tar.xz
RUN cd ./firejail-0.9.68 && ./configure && make && make install-strip

# Webapp part
RUN yarn install 
RUN yarn add cd ./client install
RUN yarn add cd ./server install
CMD yarn start

