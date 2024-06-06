FROM 192.168.2.243:5000/gss-node-alpine-20:3.18.4-1

RUN addgroup -g 700 npssuser

RUN adduser -G npssuser -D -u 700 -S -H -s /bin/sh npssuser

RUN mkdir -p /home/torus/6.0/

COPY repos /home/torus/6.0/

COPY startscript.sh /home/

RUN chmod -R 777 /home/startscript.sh

RUN chown -R npssuser:npssuser /home/

USER npssuser

WORKDIR /home

CMD sh -C 'startscript.sh';'sh'
