# Brasil em Apuros 13/22 — produção Web independente para Coolify/VPS.
# Todos os arquivos Web Godot são estáticos; NÃO requer PHP nem banco.
FROM nginx:stable-alpine
COPY deploy/vps/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html premium.css premium.js urna.html urna.css urna.js /usr/share/nginx/html/
COPY media/ /usr/share/nginx/html/media/
COPY arcade/ /usr/share/nginx/html/arcade/
COPY 13/ /usr/share/nginx/html/13/
COPY 22/ /usr/share/nginx/html/22/
RUN test -s /usr/share/nginx/html/index.html \
    && test -s /usr/share/nginx/html/arcade/index.html \
    && test -s /usr/share/nginx/html/13/index.wasm \
    && test -s /usr/share/nginx/html/13/index.pck.part01 \
    && test -s /usr/share/nginx/html/22/index.wasm \
    && test -s /usr/share/nginx/html/22/index.pck.part01 \
    && nginx -t
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
