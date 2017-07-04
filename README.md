## Customer and Item management system.

### Screenshots
[http://imgur.com/a/GihnH](http://imgur.com/a/GihnH)


#### CouchDB Views

```javascript
{
  "_id": "_design/customers",
  "views": {
    "all": {
      "map": "function (doc) {\n  emit(doc._id, 1);\n}"
    },
    "nextCustomerID": {
      "reduce": "function (key, values, rereduce) {\n    // Return the maximum numeric value.\n    var max = -Infinity\n    for(var i = 0; i < values.length; i++)\n        if(typeof values[i] == 'number')\n            max = Math.max(values[i], max)\n    return max\n}",
      "map": "function (doc) {\n    emit(null, doc.account_number);\n}"
    },
    "moneyOwed": {
      "reduce": "_sum",
      "map": "function (doc) {\n  for(var t in doc.transactions){\n    for(var i in doc.transactions[t].items){\n      if(doc.transactions[t].items[i].sold>0 && !doc.transactions[t].items[i].claimed){\n        emit(doc._id, doc.transactions[t].items[i].sold);\n      }\n    }\n  }\n}"
    },
    "itemsSold": {
      "map": "function (doc) {\n  for(var t in doc.transactions){\n    for(var i in doc.transactions[t].items){\n      if(doc.transactions[t].items[i].sold>0 && !doc.transactions[t].items[i].claimed){\n        emit(doc._id, 1);\n      }\n    }\n  }\n}",
      "reduce": "_sum"
    }
  },
  "language": "javascript"
}
```


#### Credits

This project uses
- [AngularJS](https://angularjs.org/)
- [CouchDB](http://couchdb.apache.org/)
- [Bootstrap](http://getbootstrap.com/)
- [Flat UI](http://designmodo.github.io/Flat-UI/)
