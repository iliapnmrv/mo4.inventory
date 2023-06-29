source .env

echo "creating db backup"

date="$(date '+%Y-%m-%d-%H:%M:%S')"
backup_name="inventory_$date.sql"
backup_folder="backups"

mkdir -p $backup_folder

sudo mysqldump --defaults-extra-file=config.cnf -h $DB_HOST -P $DB_PORT -u $DB_USER $DB_NAME --no-tablespaces >${PWD}/$backup_folder/$backup_name

echo "db backup created"
