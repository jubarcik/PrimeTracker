## Video Realizando o Passo a Passo
Link do Video: https://www.youtube.com/watch?v=C62BR5JMkUc


## Instalação Traccar com Mariadb

Os comandos abaixo irão atualizar o apt e instalar o unzip e o mariadb-server
```
apt update
apt install unzip mariadb-server
sudo mysql_secure_installation
```

Atualizando o usuário root e criando o banco de dados "traccar"
```
mysql -u root --execute="ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION; FLUSH PRIVILEGES; CREATE DATABASE traccar;"
```

Baixando o Traccar
```
wget https://www.traccar.org/download/traccar-linux-64-latest.zip
```

Descampactar e Instalar o Traccar
```
unzip traccar-linux-*.zip && ./traccar.run
```


Criar o arquivo de configuração Traccar.xml
```
<?xml version='1.0' encoding='UTF-8'?>

<!DOCTYPE properties SYSTEM 'http://java.sun.com/dtd/properties.dtd'>

<properties>
    <entry key="web.port">80</entry>
    <entry key="config.default">./conf/default.xml</entry>

    <entry key='database.driver'>com.mysql.cj.jdbc.Driver</entry>
    <entry key='database.url'>jdbc:mysql://localhost/traccar?	serverTimezone=UTC&amp;useSSL=false&amp;allowMultiQueries=true&amp;autoReconnect=true&amp;useUnicode=yes&amp;characterEncoding=UTF-8	&amp;sessionVariables=sql_mode=''</entry>
    <entry key='database.user'>root</entry>
    <entry key='database.password'>root</entry>

    <entry key="report.trip.minimalTripDuration">120</entry>
    <entry key="report.trip.minimalTripDistance">400</entry>
    <entry key="report.trip.minimalParkingDuration">300</entry>
    <entry key='report.fastThreshold'>604800</entry>

    <entry key='processing.copyAttributes.enable'>true</entry>
    <entry key='processing.copyAttributes'>ignition</entry>

    <entry key='web.attributes'>
    	termsUrl=
    	privacyUrl= </entry>

    <entry key='web.sanitize'>false</entry>
	
    <entry key='server.instantAcknowledgement'>true</entry>

    <entry key='filter.skipAttributes.enable'>true</entry>
    <entry key='filter.skipAttributes'>ignition,alarm,status,result,event</entry>

    <entry key='event.motion.speedThreshold'>0.45</entry>
    <entry key='filter.distance'>1</entry>

    <entry key='notificator.types'>web,sms,telegram,firebase,command</entry>
    <entry key='notificator.telegram.key'>-------</entry>
    <entry key='notificator.telegram.chatId'>----</entry>


    <entry key='notificator.firebase.serviceAccount'>
     {

     }
    </entry>

</properties>

```

Reiniciar o Traccar
```
service traccar restart
```

