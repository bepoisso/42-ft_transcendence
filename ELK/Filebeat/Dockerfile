FROM docker.elastic.co/beats/filebeat:8.11.0

USER root

COPY Filebeat/filebeat-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/filebeat-entrypoint.sh

# Create certs directory and set permissions
RUN mkdir -p /usr/share/filebeat/config/certs
RUN chown -R 1000:1000 /usr/share/filebeat


# Switch to the filebeat user (ID 1000)
USER 1000

ENTRYPOINT ["/usr/local/bin/filebeat-entrypoint.sh"]
