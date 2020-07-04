# Database

## Insertion
### server_settings
> server_id

### channel_settings
> server_id
> channel_id

### auto_channels
> server_id
> channel_id
> last_message_timestamp

### messages
> messages_id
> user_id
> station
> spy_report
> timestamp

## Updating
### server_settings
> custom_prefix
> store_consent

> server_id

### channel_settings
> starborne_server
> auto_category_enabled
> category_id
> deletion_timeout

> server_id
> channel_id

### auto_channels
> last_message_timestamp

> server_id
> channel_id

## Deletion
### server_settings
> server_id

### channel_settings
> server_id
> channel_id

### auto_channels
> server_id
> channel_id

### messages
> id