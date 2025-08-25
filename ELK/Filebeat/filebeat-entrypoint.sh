#!/bin/bash

set -e

# Remove existing configuration file and create a new one
cat > /usr/share/filebeat/filebeat.yml << EOF
# ============================== Filebeat Inputs ===============================

filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /log/*.log               # 🔁 Chemin vers les logs montés depuis les microservices
    multiline.pattern: '^\['     # (exemple) début de log avec un timestamp ou un marqueur
    multiline.negate: true
    multiline.match: after
    scan_frequency: 10s          # fréquence de scan des fichiers

# ============================== Output: Logstash ==============================

output.logstash:
  hosts: ["logstash:5044"]
  ssl.certificate_authorities: ["/usr/share/filebeat/config/certs/ca-cert.pem"]
  ssl.certificate: "/usr/share/filebeat/config/certs/filebeat-cert.pem"
  ssl.key: "/usr/share/filebeat/config/certs/filebeat-key.pem"
  ssl.verification_mode: certificate

# ============================== Logging =======================================

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat.log
  keepfiles: 7
  permissions: 0644
EOF

exec /usr/share/filebeat/filebeat -e -c /usr/share/filebeat/filebeat.yml --strict.perms=false

