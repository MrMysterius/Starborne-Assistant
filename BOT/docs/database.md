# Database

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