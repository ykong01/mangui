# old MongoDB
# docker exec -it <container_name_or_id> /bin/bash
# mongodump --username <username> --password <password> --out /data/mongo_data_backup_<date>
# docker cp <container_name_or_id>:/data/mongo_data_backup_<date> /mongo_data_backup_<date>/dump

# new MongoDB
# docker cp /mongo_data_backup_<date>/dump <container_name_or_id>:/data/dump
# docker exec -it <container_name_or_id> /bin/bash
# mongorestore --username <user> --password <password> /data/dump/