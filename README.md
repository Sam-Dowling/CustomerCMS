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
      "reduce": "_count",
      "map": "function (doc) {\n    emit(null, doc.account_number);\n}"
    },
    "moneyOwed": {
      "reduce": "_sum",
      "map": "function (doc) {\n  for(var t in doc.transactions){\n    for(var i in doc.transactions[t].items){\n      if(doc.transactions[t].items[i].sold>0 && !doc.transactions[t].items[i].claimed){\n        emit(doc._id, doc.transactions[t].items[i].sold);\n      }\n    }\n  }\n}"
    },
    "itemsSold": {
      "map": "function (doc) {\n  for(var t in doc.transactions){\n    for(var i in doc.transactions[t].items){\n      if(doc.transactions[t].items[i].sold>0 && !doc.transactions[t].items[i].claimed){\n        emit(doc._id, 1);\n      }\n    }\n  }\n}",
      "reduce": "_sum"
    },
    "commission": {
      "map": "function (doc) {\n  for (var t in doc.transactions) {\n    for (var i in doc.transactions[t].items) {\n      if (doc.transactions[t].items[i].sold > 0 && doc.transactions[t].items[i].payed_commission < doc.transactions[t].items[i].sold_date) {\n        emit(doc._id, monthDiff(doc.transactions[t].items[i].payed_commission, doc.transactions[t].items[i].sold_date)*2);\n      }else if (doc.transactions[t].items[i].sold > 0 && doc.transactions[t].items[i].payed_commission >= doc.transactions[t].items[i].sold_date) {\n        emit(doc._id, 0);\n      }else{\n        emit(doc._id, monthDiff(doc.transactions[t].items[i].payed_commission, new Date())*2);\n      }\n    }\n  }\n}\n\nfunction monthDiff(d1, d2) {\n    d1 = new Date(d1);\n    d2 = new Date(d2);\n    var months;\n    months = (d2.getFullYear() - d1.getFullYear()) * 12;\n    months -= d1.getMonth() + 1;\n    months += d2.getMonth();\n    return months <= 0 ? 0 : months;\n}",
      "reduce": "_sum"
    }
  },
  "language": "javascript"
}
```
