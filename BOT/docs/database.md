# Database Tables

### servers

Collum Name | Type | Primary Key | Not Null | Default
------------|------|-------------|----------|--------
server_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
custom_prefix | VARCHAR(5) | :x: | :x: | NULL
consent | INTEGER | :x: | :white_check_mark: | 0

### channel_settings

Collum Name | Type | Primary Key | Not Null | Default
------------|------|-------------|----------|--------
server_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
channel_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
starborne_server | INTEGER | :x: | :x: | NULL
auto_category_enabled | INTEGER | :x: | :white_check_mark: | 0
category_id | VARCHAR(50) | :x: | :x: | NULL
deletion_timeout | INTEGER | :x: | :x: | 2800

### auto_channels

Collum Name | Type | Primary Key | Not Null | Default
------------|------|-------------|----------|--------
server_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
channel_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
last_message_timestamp | INTEGER | :x: | :white_check_mark: | :x:

### messages

Collum Name | Type | Primary Key | Not Null | Default
------------|------|-------------|----------|--------
id | INTEGER | :white_check_mark: | :white_check_mark: | AUTOINCREMENT
message_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
user_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
station | TEXT | :x: | :x: | :x:
spy_report | TEXT | :x: | :x: | :x:
timestamp | INTEGER | :x: | :white_check_mark: | :x:

# Database Actions

## Insertion
### servers
> server_id

### channel_settings
> server_id <br>
> channel_id

### auto_channels
> server_id <br>
> channel_id <br>
> last_message_timestamp

### messages
> messages_id <br>
> user_id <br>
> station <br>
> spy_report <br>
> timestamp

## Updating
### servers
> custom_prefix <br>
> store_consent

> server_id

### channel_settings
> starborne_server <br>
> auto_category_enabled <br> 
> category_id <br>
> deletion_timeout

> server_id <br>
> channel_id

### auto_channels
> last_message_timestamp

> server_id <br>
> channel_id

## Deletion
### servers
> server_id

### channel_settings
> server_id <br>
> channel_id

### auto_channels
> server_id <br>
> channel_id

### messages
> id

# Database Gets

### servers
> server_id

### channel_settings
> server_id <br>
> channel_id

### auto_channels
> tiemout

### messages
> id