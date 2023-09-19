### StarRez-Js
A wrapper for the [StarRez REST API](https://miamioh.starrezhousing.com/StarRezREST/services).
## Initialization
We initialize the api using a factory class. Here we can define our authentication method and specify the domain we are connecting to.
### Basic Authentication
```js
const starRezClient = new starRezClientFactory('miamioh.starrezhousing.com')
.addBasicAuthentication('jappleseed', 'Password123')
.build();
```
### Web/Application Token
```js
const starRezClient = new starRezClientFactory('miamioh.starrezhousing.com')
.addBearerToken('efa9459e-56dc-11ee-8c99-0242ac120002')
.build();
```
## Querying Data
### Select
We can select an entire single record from a table using the `at` method.
```js
const entry = await starRezClient.from('Entry').at(1222);
console.log(`${entry.NameTitle} ${entry.LastName}, ${entry.FirstName} (${entry.NamePreferred})`);
```
### Query Builder
We can build SQL queries in an expressive way using the `select` method.
```js
const result = await starRezClient.from('Entry')
.select('EntryID', 'NameFirst', 'NameLast', 'NameTitle', 'NamePreferred')
.innerJoin('Booking', 'Booking.EntryID', 'Entry.EntryID')
.eq('Booking.RoomSpaceID', 88)
.orderBy('Booking.ContractStartDate', 'DESC')
.get();
```
