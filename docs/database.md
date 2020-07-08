# Database

## Tables

### servers

Collum Name | Datatype | PK | NN | Default
------------|----------|----|----|--------
server_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
custom_prefix | VARCHAR(5) | :x: | :x: | NULL
consent | INTEGER | :x: | :white_check_mark: | 0
owner_id | VARCHAR(50) | :x: | :white_check_mark: | :x:

### channels

Collum Name | Datatype | PK | NN | Default
------------|----------|----|----|--------
channel_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
server_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
starborne_server | INTEGER | :x: | :x: | NULL
isAutoChannelEnable | INTEGER | :x: | :x: | 0
autoChannelCategoryID | VARCHAR(50) | :x: | :white_check_mark: | :x:
autoChannelTimeout | INTEGER | :x: | :x: | 2880

### auto_channels

Collum Name | Datatype | PK | NN | Default
------------|----------|----|----|--------
channel_id | VARCHAR(50) | :white_check_mark: | :white_check_mark: | :x:
server_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
lastMessageOn | INTEGER | :x: | :x: | :x:
hex | VARCHAR(10) | :x: | :white_check_mark: | :x:
starborne_server | INTEGER | :x: | :x: | NULL
timeout | INTEGER | :x: | :white_check_mark: | :x:

### messages

Collum Name | Datatype | PK | NN | Default
------------|----------|----|----|--------
id | INTEGER | :white_check_mark: | :white_check_mark: | AUTOINCREMENT
message_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
user_id | VARCHAR(50) | :x: | :white_check_mark: | :x:
station | TEXT | :x: | :x: | :x:
spy_report | TEXT | :x: | :x: | :x:
timestamp | VARCHAR(50);

## Actions