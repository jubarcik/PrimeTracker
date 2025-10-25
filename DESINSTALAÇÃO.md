n Desinstalação Completa do Traccar + MariaDB
1 Fazer backup do banco de dados
'''
mysqldump -u root -p traccar > /root/backup-traccar-$(date +%F).sql
'''
2nn Parar serviços
systemctl stop traccar
systemctl stop mariadb
systemctl status traccar
systemctl status mariadb
3nn Remover o Traccar
/opt/traccar/bin/uninstallDaemon.sh || true
rm -rf /opt/traccar
rm -rf /var/log/traccar
rm -f /etc/systemd/system/traccar.service
systemctl daemon-reload
systemctl reset-failed
4nn Remover banco e usuário
mysql -u root -p --execute="DROP DATABASE traccar; DROP USER 'traccar'@'localhost'; FLUSH PRIVILEGES;"
5nn Desinstalar MariaDB
apt purge -y mariadb-server mariadb-client mariadb-common
apt autoremove --purge -y
apt autoclean
6nn Limpar diretórios residuais
rm -rf /etc/mysql /var/lib/mysql /var/log/mysql /var/log/mariadb /usr/share/mysql
find / -type d -name "traccar*"
