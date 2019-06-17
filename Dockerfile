FROM alpine:latest
COPY . /app
WORKDIR /app
RUN apk --no-cache add nodejs && \
    npm install && npm run build && npm prune --production && \
    rm -rf /app/src
CMD ["npm", "start"]