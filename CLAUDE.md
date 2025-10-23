# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment
- Apache Tomcat 10.0.27 server installation
- Java-based web application environment

## Common Commands
```
# Start Tomcat server
/Volumes/Yael's HDD/Project/动态网站开发/apache-tomcat-10.0.27/bin/startup.sh

# Stop Tomcat server
/Volumes/Yael's HDD/Project/动态网站开发/apache-tomcat-10.0.27/bin/shutdown.sh

# View server logs
tail -f /Volumes/Yael's HDD/Project/动态网站开发/apache-tomcat-10.0.27/logs/catalina.out
```

## Architecture
- `conf/`: Server configuration (server.xml, web.xml)
- `webapps/`: Deployed web applications
- `logs/`: Server log files
- `bin/`: Startup/shutdown scripts
- `lib/`: Common Java libraries

## Development Workflow
1. Place WAR files or unpacked applications in `webapps/`
2. Configure applications in `conf/Catalina/localhost/`
3. Modify `server.xml` for connector/port configuration
4. Restart server after configuration changes