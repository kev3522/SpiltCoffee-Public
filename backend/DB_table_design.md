# DB Entries

Feel free to make any changes you feel is necessary, this is just a basic idea of what
each entry should look like as they are scraped, stored in the DB, and fed into the
model.

## Social Media data

| Field    | Type |
| ----------- | ----------- |
| id     | text (primary key)       |
| timestamp   | int        |
| location_id      | int      |
| original_query   | varchar(140)        |
| text    | varchar(200)       |
| verified_user   | bool        |
| og_link  | varchar        |
| source   | enum(...)        |

*For source, I'm thinking the enums just be constants representing Instagram, Facebook,
Twitter, and YouTube. We would probably have to parse the og_link to determine which
one it is, but it will be super helpful later on if we want to search the database for
a specific social media.

*The id is text because we will be using uuid4 for the id generation

*original_query is limited to 140 characters because Twitter is the limiting factor
here. Also, I'm not sure how long the text should be at max, so I defaulted to 200.

## Sentiment analysis results

| Field | Type |
| ----- | ---- |
| id    | int (primary key) |
| created | date |
| query   | varchar(140) |
| neg | float |
| neu | float |
| pos | float |
| compound | float |

(neg, neu, pos, compound) is the result from the VADER model.
An owner column could be useful in the future when auth is implemented.
